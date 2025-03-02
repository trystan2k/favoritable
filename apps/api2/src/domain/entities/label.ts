export class Label {
  constructor(
    private readonly _id: number | undefined,
    private readonly _name: string,
    private readonly _color: string | undefined,
    private readonly _createdAt: Date
  ) {}

  get id(): number | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get color(): string | undefined {
    return this._color;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      color: this._color,
      createdAt: this._createdAt
    };
  }
}