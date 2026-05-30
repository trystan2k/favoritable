import { spawnSync } from 'node:child_process';

const workspace = process.argv[2];

if (!workspace) {
  throw new Error('Usage: node scripts/linear-backlog-cleanup.mjs <workspace-slug>');
}

const cleanupPlan = [
  {
    keep: 'FAV-18',
    title: 'Bookmark Backend Foundation and CRUD',
    absorbs: ['FAV-16', 'FAV-17'],
  },
  {
    keep: 'FAV-19',
    title: 'Bookmark Creation and Enriched Browsing Experience',
    absorbs: ['FAV-20', 'FAV-21', 'FAV-22', 'FAV-56'],
  },
  {
    keep: 'FAV-23',
    title: 'Bookmark States and Default Collections',
    absorbs: ['FAV-24', 'FAV-25', 'FAV-26', 'FAV-32'],
  },
  {
    keep: 'FAV-27',
    title: 'Labels Management and Bookmark Filtering',
    absorbs: ['FAV-28', 'FAV-29', 'FAV-30', 'FAV-31'],
  },
  {
    keep: 'FAV-33',
    title: 'Bookmark Search and Sort',
    absorbs: ['FAV-34', 'FAV-35', 'FAV-36'],
  },
  {
    keep: 'FAV-37',
    title: 'Bookmark Import Pipeline',
    absorbs: ['FAV-38', 'FAV-39', 'FAV-40', 'FAV-51'],
  },
  {
    keep: 'FAV-41',
    title: 'Bookmark Export, Backup, and Bulk Management',
    absorbs: ['FAV-42', 'FAV-43', 'FAV-44'],
  },
  {
    keep: 'FAV-45',
    title: 'Application Shell, Theming, Responsiveness, and Accessibility',
    absorbs: ['FAV-46', 'FAV-47', 'FAV-48'],
  },
  {
    keep: 'FAV-49',
    title: 'Frontend Architecture and Quality Baseline',
    absorbs: ['FAV-59', 'FAV-60'],
  },
  {
    keep: 'FAV-53',
    title: 'Production Readiness, Deployment, and Operational Hygiene',
    absorbs: ['FAV-54', 'FAV-55', 'FAV-67'],
  },
];

const additionalRelations = [
  ['FAV-18', 'FAV-19'],
  ['FAV-18', 'FAV-23'],
  ['FAV-18', 'FAV-27'],
  ['FAV-18', 'FAV-33'],
  ['FAV-18', 'FAV-37'],
  ['FAV-18', 'FAV-41'],
  ['FAV-19', 'FAV-45'],
  ['FAV-23', 'FAV-45'],
  ['FAV-27', 'FAV-45'],
  ['FAV-19', 'FAV-61'],
];

for (const group of cleanupPlan) {
  updateIssueTitle(group.keep, group.title);
  addComment(
    group.keep,
    [
      'Backlog consolidation applied.',
      '',
      `This issue now absorbs scope from: ${group.absorbs.join(', ')}.`,
      'Treat the absorbed issues as historical placeholders only.',
    ].join('\n')
  );

  for (const absorbedIssue of group.absorbs) {
    addComment(
      absorbedIssue,
      [
        'Absorbed during backlog consolidation.',
        '',
        `Superseded by ${group.keep} (${group.title}).`,
        'Closing this issue as Duplicate to keep history while removing backlog noise.',
      ].join('\n')
    );
    ensureRelation(absorbedIssue, 'duplicate', group.keep);
    updateIssueState(absorbedIssue, 'Duplicate');
  }
}

for (const [blockingIssue, blockedIssue] of additionalRelations) {
  ensureBlocksRelation(blockingIssue, blockedIssue);
}

writeLine('Linear backlog cleanup complete.');

function updateIssueTitle(issueId, title) {
  runLinear(['issue', 'update', issueId, '--workspace', workspace, '--title', title]);
  writeLine(`Renamed ${issueId} -> ${title}`);
}

function updateIssueState(issueId, state) {
  runLinear(['issue', 'update', issueId, '--workspace', workspace, '--state', state]);
  writeLine(`Moved ${issueId} -> ${state}`);
}

function addComment(issueId, body) {
  runLinear(['issue', 'comment', 'add', issueId, '--workspace', workspace, '--body', body]);
  writeLine(`Commented ${issueId}`);
}

function ensureBlocksRelation(blockingIssue, blockedIssue) {
  ensureRelation(blockingIssue, 'blocks', blockedIssue);
}

function ensureRelation(issueId, relationType, relatedIssueId) {
  const existing = runLinearJson(
    ['api', '--workspace', workspace, '--variables-json', JSON.stringify({ identifier: issueId })],
    `query($identifier: String!) {
    issue(id: $identifier) {
      relations {
        nodes {
          type
          relatedIssue {
            identifier
          }
        }
      }
    }
  }`
  );

  const relations = existing.data?.issue?.relations?.nodes ?? [];
  const alreadyExists = relations.some(
    (relation) =>
      relation.type === relationType && relation.relatedIssue?.identifier === relatedIssueId
  );

  if (alreadyExists) {
    writeLine(`Relation exists: ${issueId} ${relationType} ${relatedIssueId}`);
    return;
  }

  runLinear([
    'issue',
    'relation',
    'add',
    issueId,
    relationType,
    relatedIssueId,
    '--workspace',
    workspace,
  ]);
  writeLine(`Added relation: ${issueId} ${relationType} ${relatedIssueId}`);
}

function runLinear(args) {
  const result = spawnSync('linear', args, {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Linear command failed');
  }

  return result.stdout;
}

function runLinearJson(args, input) {
  const result = spawnSync('linear', args, {
    encoding: 'utf8',
    input,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Linear JSON command failed');
  }

  const response = JSON.parse(result.stdout);

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '));
  }

  return response;
}

function writeLine(message) {
  process.stdout.write(`${message}\n`);
}
