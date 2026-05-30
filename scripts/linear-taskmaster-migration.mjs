import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const TASKS_PATH = path.join(PROJECT_ROOT, '.taskmaster/tasks/tasks.json');
const DEV_LOGS_DIR = path.join(PROJECT_ROOT, 'docs/memories/development-logs');
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, '.taskmaster/reports/linear-migration-dry-run');

const args = process.argv.slice(2);

const options = {
  outputDir: DEFAULT_OUTPUT_DIR,
  project: 'Favoritable',
  team: 'FAV',
  workspace: '',
  writeFiles: true,
  apply: false,
};

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];

  if (argument === '--output-dir') {
    options.outputDir = path.resolve(PROJECT_ROOT, args[index + 1]);
    index += 1;
    continue;
  }

  if (argument === '--project') {
    options.project = args[index + 1];
    index += 1;
    continue;
  }

  if (argument === '--team') {
    options.team = args[index + 1];
    index += 1;
    continue;
  }

  if (argument === '--workspace') {
    options.workspace = args[index + 1];
    index += 1;
    continue;
  }

  if (argument === '--apply') {
    options.apply = true;
    continue;
  }

  if (argument === '--no-write-files') {
    options.writeFiles = false;
    continue;
  }

  if (argument === '--help') {
    printHelp();
    process.exit(0);
  }
}

const taskMasterData = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
const tasks = taskMasterData.master?.tasks ?? [];
const devLogs = getDevelopmentLogs();

const plan = buildPlan(tasks, devLogs, options);

if (options.writeFiles) {
  writeDryRunFiles(plan, options.outputDir);
}

if (options.apply) {
  const importResult = applyPlan(plan, options);

  if (options.writeFiles) {
    fs.writeFileSync(
      path.join(options.outputDir, 'import-result.json'),
      `${JSON.stringify(importResult, null, 2)}\n`,
      'utf8'
    );
  }

  printImportSummary(importResult, options);
  process.exit(0);
}

printSummary(plan, options);

function writeLine(message = '') {
  process.stdout.write(`${message}\n`);
}

function printHelp() {
  writeLine(`Usage: node scripts/linear-taskmaster-migration.mjs [options]

Options:
  --output-dir <path>   Dry-run output directory
  --project <name>      Linear project name in preview data
  --team <key>          Linear team key in preview data
  --workspace <slug>    Linear workspace slug for live import
  --apply               Create issues and dependency links in Linear
  --no-write-files      Skip writing preview files and print summary only
  --help                Show this help
`);
}

function getDevelopmentLogs() {
  if (!fs.existsSync(DEV_LOGS_DIR)) {
    return new Map();
  }

  const entries = fs.readdirSync(DEV_LOGS_DIR, { withFileTypes: true });
  const logs = new Map();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }

    const match = entry.name.match(/^task-(\d+)-/);

    if (!match) {
      continue;
    }

    const taskId = Number(match[1]);
    const filePath = path.join(DEV_LOGS_DIR, entry.name);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const historicalDate = content.match(/\*\*Date\*\*:\s*(.+)/)?.[1]?.trim() ?? null;

    logs.set(taskId, {
      fileName: entry.name,
      filePath,
      historicalDate,
      content,
    });
  }

  return logs;
}

function buildPlan(tasksList, logs, currentOptions) {
  const issues = tasksList.map((task) =>
    buildIssuePreview(task, logs.get(task.id), currentOptions)
  );
  const issueMap = new Map(issues.map((issue) => [issue.taskMasterId, issue.previewKey]));
  const relations = [];

  for (const issue of issues) {
    for (const dependency of issue.dependencies) {
      const relatedPreviewKey = issueMap.get(dependency);

      if (!relatedPreviewKey) {
        continue;
      }

      relations.push({
        issuePreviewKey: issue.previewKey,
        issueTaskMasterId: issue.taskMasterId,
        relationType: 'blocked-by',
        relatedIssuePreviewKey: relatedPreviewKey,
        relatedTaskMasterId: dependency,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      tasksPath: path.relative(PROJECT_ROOT, TASKS_PATH),
      devLogsDir: path.relative(PROJECT_ROOT, DEV_LOGS_DIR),
    },
    target: {
      project: currentOptions.project,
      team: currentOptions.team,
    },
    summary: summarize(issues, relations),
    issues,
    relations,
  };
}

function buildIssuePreview(task, devLog, currentOptions) {
  const subtasks = task.subtasks ?? [];
  const previewKey = `TM-${String(task.id).padStart(3, '0')}`;

  return {
    previewKey,
    taskMasterId: task.id,
    title: task.title,
    description: buildDescription(task, subtasks, devLog),
    project: currentOptions.project,
    team: currentOptions.team,
    state: mapState(task.status),
    priority: mapPriority(task.priority),
    originalStatus: task.status,
    originalPriority: task.priority,
    dependencies: task.dependencies ?? [],
    subtaskCount: subtasks.length,
    completedSubtaskCount: subtasks.filter((subtask) => subtask.status === 'done').length,
    hasDevelopmentLog: Boolean(devLog),
    historicalDate: devLog?.historicalDate ?? null,
    devLogFile: devLog?.fileName ?? null,
  };
}

function buildDescription(task, subtasks, devLog) {
  const sections = [
    '## Imported from Task Master',
    '',
    `- Task Master ID: ${task.id}`,
    `- Original Status: ${task.status}`,
    `- Original Priority: ${task.priority}`,
    `- Original Dependencies: ${formatDependencies(task.dependencies ?? [])}`,
  ];

  if (devLog?.historicalDate) {
    sections.push(`- Historical Completion Date: ${devLog.historicalDate}`);
  }

  sections.push('', '## Original Description', '', task.description?.trim() || 'N/A');
  sections.push('', '## Original Details', '', normalizeMultilineText(task.details));
  sections.push('', '## Original Test Strategy', '', normalizeMultilineText(task.testStrategy));
  sections.push('', '## Subtasks', '', ...buildSubtaskLines(subtasks));

  if (devLog) {
    sections.push('', '## Historical Development Log', '', devLog.content);
  } else if (task.status === 'done') {
    sections.push(
      '',
      '## Historical Development Log',
      '',
      '_No matching development log found. Imported from Task Master metadata only._'
    );
  }

  return sections.join('\n');
}

function buildSubtaskLines(subtasks) {
  if (subtasks.length === 0) {
    return ['_No subtasks_'];
  }

  return subtasks.map((subtask) => {
    const checked = subtask.status === 'done' ? 'x' : ' ';
    return `- [${checked}] ${subtask.id}. ${subtask.title}`;
  });
}

function formatDependencies(dependencies) {
  if (dependencies.length === 0) {
    return 'None';
  }

  return dependencies.join(', ');
}

function normalizeMultilineText(value) {
  const text = value?.trim();
  return text && text.length > 0 ? text : 'N/A';
}

function mapState(status) {
  switch (status) {
    case 'done':
      return 'Done';
    case 'in-progress':
      return 'In Progress';
    case 'blocked':
      return 'Backlog';
    case 'cancelled':
      return 'Canceled';
    case 'pending':
    case 'deferred':
    default:
      return 'Backlog';
  }
}

function mapPriority(priority) {
  switch (priority) {
    case 'high':
      return 1;
    case 'medium':
      return 2;
    case 'low':
      return 3;
    default:
      return 4;
  }
}

function summarize(issues, relations) {
  const stateCounts = {};

  for (const issue of issues) {
    stateCounts[issue.state] = (stateCounts[issue.state] ?? 0) + 1;
  }

  return {
    issueCount: issues.length,
    relationCount: relations.length,
    completedIssueCount: issues.filter((issue) => issue.originalStatus === 'done').length,
    pendingIssueCount: issues.filter((issue) => issue.originalStatus !== 'done').length,
    issuesWithDevelopmentLogs: issues.filter((issue) => issue.hasDevelopmentLog).length,
    completedIssuesWithoutDevelopmentLogs: issues
      .filter((issue) => issue.originalStatus === 'done' && !issue.hasDevelopmentLog)
      .map((issue) => issue.taskMasterId),
    stateCounts,
  };
}

function writeDryRunFiles(planData, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  const descriptionsDir = path.join(outputDir, 'descriptions');
  fs.mkdirSync(descriptionsDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, 'plan.json'),
    `${JSON.stringify(planData, null, 2)}\n`,
    'utf8'
  );

  for (const issue of planData.issues) {
    const filePath = path.join(
      descriptionsDir,
      `${String(issue.taskMasterId).padStart(3, '0')}-${slugify(issue.title)}.md`
    );

    fs.writeFileSync(filePath, `${issue.description}\n`, 'utf8');
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function printSummary(planData, currentOptions) {
  writeLine(`Dry run ready for Linear project ${currentOptions.project} (${currentOptions.team})`);
  writeLine(`Issues: ${planData.summary.issueCount}`);
  writeLine(`Relations: ${planData.summary.relationCount}`);
  writeLine(`Completed issues: ${planData.summary.completedIssueCount}`);
  writeLine(`Pending issues: ${planData.summary.pendingIssueCount}`);
  writeLine(`Issues with dev logs: ${planData.summary.issuesWithDevelopmentLogs}`);
  writeLine(
    `Completed issues without dev logs: ${planData.summary.completedIssuesWithoutDevelopmentLogs.join(', ') || 'none'}`
  );

  for (const [state, count] of Object.entries(planData.summary.stateCounts)) {
    writeLine(`State ${state}: ${count}`);
  }

  if (currentOptions.writeFiles) {
    writeLine(`Output: ${path.relative(PROJECT_ROOT, currentOptions.outputDir)}`);
  }
}

function printImportSummary(importResult, currentOptions) {
  writeLine(
    `Import complete for Linear project ${currentOptions.project} (${currentOptions.team})`
  );
  writeLine(`Created issues: ${importResult.createdIssues.length}`);
  writeLine(`Created relations: ${importResult.createdRelations.length}`);

  if (currentOptions.writeFiles) {
    writeLine(`Output: ${path.relative(PROJECT_ROOT, currentOptions.outputDir)}`);
  }
}

function applyPlan(planData, currentOptions) {
  if (!currentOptions.workspace) {
    throw new Error('Missing required --workspace for --apply mode.');
  }

  const linearContext = getLinearContext(currentOptions);
  assertProjectIsEmpty(currentOptions, linearContext.project.id);

  const createdIssues = [];
  const identifierByTaskId = new Map();

  for (const issue of planData.issues) {
    const createdIssue = createLinearIssue(issue, linearContext, currentOptions.workspace);
    createdIssues.push(createdIssue);
    identifierByTaskId.set(issue.taskMasterId, createdIssue.identifier);
    writeLine(`Created ${createdIssue.identifier}: ${createdIssue.title}`);
  }

  const createdRelations = [];

  for (const relation of planData.relations) {
    const dependencyIdentifier = identifierByTaskId.get(relation.relatedTaskMasterId);
    const blockedIdentifier = identifierByTaskId.get(relation.issueTaskMasterId);

    if (!dependencyIdentifier || !blockedIdentifier) {
      continue;
    }

    createLinearRelation(dependencyIdentifier, blockedIdentifier, currentOptions.workspace);
    createdRelations.push({
      fromIdentifier: dependencyIdentifier,
      toIdentifier: blockedIdentifier,
      type: 'blocks',
      sourceTaskMasterId: relation.relatedTaskMasterId,
      targetTaskMasterId: relation.issueTaskMasterId,
    });
  }

  return {
    importedAt: new Date().toISOString(),
    workspace: currentOptions.workspace,
    project: currentOptions.project,
    team: currentOptions.team,
    createdIssues,
    createdRelations,
  };
}

function getLinearContext(currentOptions) {
  const teamResponse = runLinearApi(
    `query($filter: TeamFilter) {
      teams(filter: $filter) {
        nodes {
          id
          key
          name
          states {
            nodes {
              id
              name
            }
          }
        }
      }
    }`,
    { filter: { key: { eq: currentOptions.team } } },
    currentOptions.workspace
  );
  const team = teamResponse.data?.teams?.nodes?.[0];

  if (!team) {
    throw new Error(`Linear team not found: ${currentOptions.team}`);
  }

  const projectResponse = runLinearApi(
    `query($filter: ProjectFilter) {
      projects(filter: $filter) {
        nodes {
          id
          name
          slugId
        }
      }
    }`,
    { filter: { name: { eq: currentOptions.project } } },
    currentOptions.workspace
  );
  const project = projectResponse.data?.projects?.nodes?.[0];

  if (!project) {
    throw new Error(`Linear project not found: ${currentOptions.project}`);
  }

  const stateIds = Object.fromEntries(team.states.nodes.map((state) => [state.name, state.id]));

  return {
    team: {
      id: team.id,
      key: team.key,
      name: team.name,
      stateIds,
    },
    project,
  };
}

function assertProjectIsEmpty(currentOptions, projectId) {
  const response = runLinearApi(
    `query($filter: IssueFilter) {
      issues(filter: $filter, first: 1) {
        nodes {
          id
        }
      }
    }`,
    { filter: { project: { id: { eq: projectId } } } },
    currentOptions.workspace
  );
  const existingIssues = response.data?.issues?.nodes ?? [];

  if (existingIssues.length > 0) {
    throw new Error(`Linear project ${currentOptions.project} is not empty. Aborting import.`);
  }
}

function createLinearIssue(issue, linearContext, workspace) {
  const stateId = linearContext.team.stateIds[issue.state];

  if (!stateId) {
    throw new Error(`Missing Linear workflow state mapping for ${issue.state}`);
  }

  const response = runLinearApi(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }`,
    {
      input: {
        teamId: linearContext.team.id,
        projectId: linearContext.project.id,
        stateId,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
      },
    },
    workspace
  );
  const createdIssue = response.data?.issueCreate?.issue;

  if (!response.data?.issueCreate?.success || !createdIssue) {
    throw new Error(`Failed to create Linear issue for Task Master task ${issue.taskMasterId}`);
  }

  return {
    taskMasterId: issue.taskMasterId,
    id: createdIssue.id,
    identifier: createdIssue.identifier,
    title: createdIssue.title,
    url: createdIssue.url,
    state: issue.state,
  };
}

function createLinearRelation(blockingIssueIdentifier, blockedIssueIdentifier, workspace) {
  const response = runLinearApi(
    `mutation($input: IssueRelationCreateInput!) {
      issueRelationCreate(input: $input) {
        success
      }
    }`,
    {
      input: {
        issueId: blockingIssueIdentifier,
        relatedIssueId: blockedIssueIdentifier,
        type: 'blocks',
      },
    },
    workspace
  );

  if (!response.data?.issueRelationCreate?.success) {
    throw new Error(
      `Failed to create Linear relation ${blockingIssueIdentifier} blocks ${blockedIssueIdentifier}`
    );
  }
}

function runLinearApi(query, variables, workspace) {
  const command = ['api', '--workspace', workspace, '--variables-json', JSON.stringify(variables)];
  const result = spawnSync('linear', command, {
    input: query,
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || 'Unknown Linear API error';
    throw new Error(detail);
  }

  const response = JSON.parse(result.stdout);

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '));
  }

  return response;
}
