import { Label } from './label.js';

export class Bookmark {
  constructor(
    private readonly _id: number | undefined,
    private readonly _slug: string,
    private readonly _title: string,
    private readonly _description: string | undefined,
    private readonly _author: string | undefined,
    private readonly _url: string,
    private readonly _thumbnail: string | undefined,
    private readonly _publishedAt: Date | undefined,
    private readonly _savedAt: Date,
    private readonly _updatedAt: Date,
    private _labels: Label[] = []
  ) { }

  get id(): number | undefined {
    return this._id;
  }

  get slug(): string {
    return this._slug;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get author(): string | undefined {
    return this._author;
  }

  get url(): string {
    return this._url;
  }

  get thumbnail(): string | undefined {
    return this._thumbnail;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get savedAt(): Date {
    return this._savedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get labels(): Label[] {
    return [...this._labels];
  }

  addLabel(label: Label): void {
    if (!this._labels.some(l => l.id === label.id)) {
      this._labels.push(label);
    }
  }

  removeLabel(labelId: number): void {
    this._labels = this._labels.filter(l => l.id !== labelId);
  }

  clearLabels(): void {
    this._labels = [];
  }

  toJSON() {
    return {
      id: this._id,
      slug: this._slug,
      title: this._title,
      description: this._description,
      author: this._author,
      url: this._url,
      thumbnail: this._thumbnail,
      publishedAt: this._publishedAt,
      savedAt: this._savedAt,
      updatedAt: this._updatedAt,
      labels: this._labels.map(l => l.toJSON())
    };
  }
}
