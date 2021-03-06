import * as fs from "fs";
import * as pfs from "../../../util/misc/promisfied-fs";

export interface IByteRange {
  start: number;
  length: number;
}

export async function getByteRange(path: string, start: number, length: number): Promise<number[]> {
  let fd = await pfs.open(path, "r", null);
  try {
    let buffer = new Buffer(length);
    let readResult = await pfs.read(fd, buffer, 0, length, start);

    let result: number[] = [];
    
    for (let i = 0; i < readResult.bytesRead; i++) {
      result.push(buffer[i]);
    }
    
    return result;
  }
  finally {
    await pfs.close(fd);
  }
}

export function parseRange(byteRange: string): IByteRange {
  let separatorIndex = byteRange.indexOf("-");
  if (separatorIndex === -1) {
    throw new Error(`Invalid byte range: "${byteRange}"`);
  }
  let start = parseInt(byteRange.substr(0, separatorIndex));
  let end = parseInt(byteRange.substr(separatorIndex + 1, byteRange.length - separatorIndex - 1));

  if (isNaN(start) || isNaN(end) || start < 0 || start > end) {
    throw new Error(`Invalid byte range: "${byteRange}"`);
  }

  return { start: start, length: end - start + 1 };
}