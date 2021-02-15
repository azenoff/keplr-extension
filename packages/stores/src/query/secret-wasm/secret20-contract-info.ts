import { Secret20ContractTokenInfo } from "./types";
import { KVStore } from "@keplr/common";
import { ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { computed, observable } from "mobx";
import { Keplr } from "@keplr/types";
import { ObservableSecretContractChainQuery } from "./contract-query";

export class ObservableQuerySecret20ContactInfoInner extends ObservableSecretContractChainQuery<Secret20ContractTokenInfo> {
  @observable.ref
  protected keplr?: Keplr;

  protected nonce?: Uint8Array;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    // Don't need to set the url initially because it can't request without encyption.
    super(
      kvStore,
      chainId,
      chainGetter,
      contractAddress,
      { token_info: {} },
      querySecretContractCodeHash
    );
  }

  @computed
  get tokenInfo(): Secret20ContractTokenInfo["token_info"] | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.token_info;
  }
}

export class ObservableQuerySecret20ContractInfo extends ObservableChainQueryMap<Secret20ContractTokenInfo> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    super(kvStore, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQuerySecret20ContactInfoInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        contractAddress,
        querySecretContractCodeHash
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQuerySecret20ContactInfoInner {
    return this.get(contractAddress) as ObservableQuerySecret20ContactInfoInner;
  }
}
