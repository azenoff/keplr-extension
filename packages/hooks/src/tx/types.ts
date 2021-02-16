import { AppCurrency, Currency } from "@keplr/types";
import { StdFee } from "@cosmjs/launchpad";
import { CoinPretty } from "@keplr/unit";
import { CoinPrimitive } from "@keplr/stores";

export interface ITxChainSetter {
  chainId: string;
  setChain(chainId: string): void;
}

export interface IMemoConfig extends ITxChainSetter {
  memo: string;
  setMemo(memo: string): void;

  getError(): Error | undefined;
}

export interface IGasConfig extends ITxChainSetter {
  gas: number;
  setGas(gas: number): void;

  getError(): Error | undefined;
}

export interface IFeeConfig extends ITxChainSetter {
  feeType: FeeType | undefined;
  setFeeType(feeType: FeeType | undefined): void;
  feeCurrencies: Currency[];
  feeCurrency: Currency | undefined;
  toStdFee(): StdFee;
  fee: CoinPretty | undefined;
  getFeeTypePretty(feeType: FeeType): CoinPretty;
  getFeePrimitive(): CoinPrimitive | undefined;

  getError(): Error | undefined;
}

export interface IRecipientConfig extends ITxChainSetter {
  recipient: string;
  setRecipient(recipient: string): void;

  getError(): Error | undefined;
}

export interface IAmountConfig extends ITxChainSetter {
  amount: string;
  setAmount(amount: string): void;
  getAmountPrimitive(): CoinPrimitive;
  sendCurrency: AppCurrency;
  setSendCurrency(currency: AppCurrency | undefined): void;
  sendableCurrencies: AppCurrency[];
  sender: string;
  setSender(sender: string): void;

  getError(): Error | undefined;
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

export type FeeType = "high" | "average" | "low";
