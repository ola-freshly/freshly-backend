export class ScanResultDto {
  name!: string;
  category!: string;
  expirationDate!: string | null;
  usageInstruction!: string | null;
  confidence!: number;
}
