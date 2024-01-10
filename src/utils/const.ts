export enum InvoicingType {
  NORMAL = "普票",
  SPECIAL = "专票",
}

export enum Moneytype {
  Dollar = "美元",
  RMB = "人民币",
}

export enum BoolType {
  YES = "√",
  NO = "x",
}

export const InvoicingTypeArr = [InvoicingType.NORMAL, InvoicingType.SPECIAL];

export const MoneytypeArr = [Moneytype.RMB, Moneytype.Dollar];

export const BooltypeArr = [BoolType.NO, BoolType.YES];

export const SM_PUBLIC_KEY =
  "044adea296eb01795bcf8ec2da485c9217c0cff44fb8df69f7862b0378fdb303cf0486b06e2d2f1fc3f98ef426ecf5cc14f6c2fb587523f48b6e7573e51d89e8d9";
