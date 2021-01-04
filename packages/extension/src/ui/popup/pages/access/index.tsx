import React, { FunctionComponent, useEffect, useMemo } from "react";

import { Button } from "reactstrap";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "../../../hooks/use-interaction-info";

export const AccessPage: FunctionComponent = observer(() => {
  const ineractionInfo = useInteractionInfo();

  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingDatas.length > 0
      ? permissionStore.waitingDatas[0]
      : undefined;

  const isSecretWasm = useMemo(() => {
    if (chainStore.chainInfo.features) {
      return chainStore.chainInfo.features.indexOf("secretwasm") >= 0;
    }
    return false;
  }, [chainStore.chainInfo.features]);

  useEffect(() => {
    if (waitingPermission) {
      chainStore.setChain(waitingPermission.data.chainId);
    }
  }, [chainStore, waitingPermission]);

  const host = useMemo(() => {
    if (waitingPermission) {
      return waitingPermission.data.origins
        .map(origin => {
          return new URL(origin).host;
        })
        .join(",");
    } else {
      return "";
    }
  }, [waitingPermission]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("../../public/assets/temp-icon.svg")}
          alt="logo"
          style={{ height: "92px" }}
        />
        <h1 className={style.header}>
          <FormattedMessage id="access.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="access.paragraph"
            values={{
              host,
              chainId: waitingPermission?.data.chainId,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>
            }}
          />
        </p>
        <div className={style.permission}>
          <FormattedMessage id="access.permission.title" />
        </div>
        <ul>
          <li>
            <FormattedMessage id="access.permission.account" />
          </li>
          <li>
            <FormattedMessage id="access.permission.tx-request" />
          </li>
          {isSecretWasm ? (
            <li>
              <FormattedMessage id="access.permission.secret" />
            </li>
          ) : null}
        </ul>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            onClick={async e => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
                if (permissionStore.waitingDatas.length === 0) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={async e => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (permissionStore.waitingDatas.length === 0) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});