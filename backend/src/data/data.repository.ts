export abstract class DataRepository {
  abstract getMaintenanceTasks(): any[];
  abstract saveMaintenanceTasks(tasks: any[]): void;
  abstract getTrains(): any[];
  abstract getSections(): any[];
  abstract getAssets(): any[];
  abstract getBlocks(): any[];
  abstract saveBlocks(blocks: any[]): void;
  abstract getEvents(): any[];
}
