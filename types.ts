export interface Student {
  id: string;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  students: Student[];
}

export enum SortMethod {
  RANDOM = 'RANDOM',
}

export interface GenerationConfig {
  groupCount: number;
  method: SortMethod;
}
