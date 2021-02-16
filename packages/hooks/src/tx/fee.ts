import { DefaultGasPriceStep, FeeType, IFeeConfig, IGasConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter, CoinPrimitive } from "@keplr/stores";
import { action, computed, observable } from "mobx";
import { CoinPretty, Dec, Int } from "@keplr/unit";
import { Currency } from "@keplr/types";
import { computedFn } from "mobx-utils";
import { StdFee } from "@cosmjs/launchpad";
import { useState } from "react";

export class FeeConfig extends TxChainSetter implements IFeeConfig {
  @observable
  protected _feeType: FeeType | undefined;

  @observable
  protected _manualFee: CoinPrimitive | undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly gasConfig: IGasConfig
  ) {
    super(chainGetter, initialChainId);
  }

  @action
  setFeeType(feeType: FeeType | undefined) {
    this._feeType = feeType;
    this._manualFee = undefined;
  }

  get feeType(): FeeType | undefined {
    return this._feeType;
  }

  @action
  setManualFee(fee: CoinPrimitive) {
    this._manualFee = fee;
    this._feeType = undefined;
  }

  get feeCurrencies(): Currency[] {
    return this.chainInfo.feeCurrencies;
  }

  get feeCurrency(): Currency | undefined {
    return this.chainInfo.feeCurrencies[0];
  }

  toStdFee(): StdFee {
    const amount = this.getFeePrimitive();
    if (!amount) {
      return {
        gas: this.gasConfig.gas.toString(),
        amount: [],
      };
    }

    return {
      gas: this.gasConfig.gas.toString(),
      amount: [amount],
    };
  }

  @computed
  get fee(): CoinPretty | undefined {
    if (!this.feeCurrency) {
      return undefined;
    }

    const feePrimitive = this.getFeePrimitive();
    if (!feePrimitive) {
      return undefined;
    }

    return new CoinPretty(this.feeCurrency, new Int(feePrimitive.amount));
  }

  getFeePrimitive(): CoinPrimitive | undefined {
    // If there is no fee currency, just return with empty fee amount.
    if (!this.feeCurrency) {
      return undefined;
    }

    if (this._manualFee) {
      return this._manualFee;
    }

    if (this.feeType) {
      return this.getFeeTypePrimitive(this.feeType);
    }

    // If fee is not set, just return with empty fee amount.
    return undefined;
  }

  protected getFeeTypePrimitive(feeType: FeeType): CoinPrimitive {
    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const gasPriceStep = this.chainInfo.gasPriceStep
      ? this.chainInfo.gasPriceStep
      : DefaultGasPriceStep;

    const gasPrice = new Dec(gasPriceStep[feeType].toString());
    const feeAmount = gasPrice.mul(new Dec(this.gasConfig.gas));

    return {
      denom: this.feeCurrency.coinMinimalDenom,
      amount: feeAmount.truncate().toString(),
    };
  }

  readonly getFeeTypePretty = computedFn((feeType: FeeType) => {
    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const feeTypePrimitive = this.getFeeTypePrimitive(feeType);
    const feeCurrency = this.feeCurrency;

    return new CoinPretty(feeCurrency, new Int(feeTypePrimitive.amount))
      .precision(feeCurrency.coinDecimals)
      .maxDecimals(feeCurrency.coinDecimals);
  });

  getError(): Error | undefined {
    if (this.gasConfig.getError()) {
      return this.gasConfig.getError();
    }
  }
}

export const useFeeConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  gasConfig: IGasConfig
) => {
  const [config] = useState(new FeeConfig(chainGetter, chainId, gasConfig));
  config.setChain(chainId);

  return config;
};
