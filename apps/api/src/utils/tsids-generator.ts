import crypto from 'node:crypto';

/**
 * TSID (Time-Sorted Identifier) Generator
 * Generates unique, time-sortable, URL-safe IDs
 */
class TsidGenerator {
  private nodeId: number;
  private lastTimestamp: number = 0;
  private sequence: number = 0;

  // Constants for TSID generation
  private static readonly EPOCH = 1735689600000; // 2025-01-01 00:00:00 UTC
  private static readonly SEQUENCE_BITS = 12;
  private static readonly NODE_BITS = 10;
  private static readonly MAX_SEQUENCE = (1 << TsidGenerator.SEQUENCE_BITS) - 1;
  private static readonly MAX_NODE_ID = (1 << TsidGenerator.NODE_BITS) - 1;

  /**
   * Creates a new TSID generator
   * @param nodeId Optional node identifier (0-1023). Random if not provided.
   */
  constructor(nodeId?: number) {
    if (nodeId !== undefined) {
      if (nodeId < 0 || nodeId > TsidGenerator.MAX_NODE_ID) {
        throw new Error(`Node ID must be between 0 and ${TsidGenerator.MAX_NODE_ID}`);
      }
      this.nodeId = nodeId;
    } else {
      // Generate a random node ID if not provided
      this.nodeId = crypto.randomInt(TsidGenerator.MAX_NODE_ID + 1);
    }
  }

  /**
   * Generates a new TSID
   * @returns A string representation of the TSID
   */
  generate() {
    let timestamp = Date.now() - TsidGenerator.EPOCH;

    // Handle clock drift or time moving backwards
    if (timestamp < this.lastTimestamp) {
      timestamp = this.lastTimestamp;
    }

    // If we're on the same millisecond as the last ID, increment sequence
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & TsidGenerator.MAX_SEQUENCE;
      // If sequence overflows, move to next millisecond
      if (this.sequence === 0) {
        timestamp++;
        while (Date.now() - TsidGenerator.EPOCH < timestamp) {
          // Wait for the clock to catch up
        }
      }
    } else {
      // Reset sequence for new millisecond
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // Construct the 64-bit TSID
    const tsid =
      (BigInt(timestamp) << BigInt(TsidGenerator.SEQUENCE_BITS + TsidGenerator.NODE_BITS)) |
      (BigInt(this.nodeId) << BigInt(TsidGenerator.SEQUENCE_BITS)) |
      BigInt(this.sequence);

    return String(tsid);
  }

  /**
   * Extract the timestamp from a TSID
   * @param tsid The TSID to extract timestamp from
   * @returns Date object representing the timestamp
   */
  static extractDate(tsid: string): Date {
    const num = BigInt(tsid);
    const timestamp = Number(num >> BigInt(TsidGenerator.SEQUENCE_BITS + TsidGenerator.NODE_BITS));
    return new Date(timestamp + TsidGenerator.EPOCH);
  }
}

export const tsidGenerator = new TsidGenerator();
