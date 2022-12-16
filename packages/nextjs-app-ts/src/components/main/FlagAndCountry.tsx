/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Button, Card, List } from 'antd';
import axios from 'axios';
import { Address, AddressInput } from 'eth-components/ant';
import { useContractReader } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC, useState, useEffect } from 'react';

import { useAppContracts } from '~common/components/context';

export interface IFlagAndCountryProps {
  blockExplorer: string | undefined;
  mainnetProvider: StaticJsonRpcProvider;
}

/**
 * 🗺 Footer: Extra UI like gas price, eth price, faucet, and support:
 * @param props
 * @returns
 */
export const FlagAndCountry: FC<IFlagAndCountryProps> = (props) => {
  const ethersAppContext = useEthersAppContext();
  const flagAndCountry = useAppContracts('FlagAndCountry', ethersAppContext.chainId);
  const { blockExplorer, mainnetProvider } = props;

  const [balance, updateBalance] = useContractReader(
    flagAndCountry,
    flagAndCountry?.balanceOf,
    [`${ethersAppContext.account}`],
    flagAndCountry?.filters.Transfer()
  );

  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});
  const [FlagAndCountries, setFlagAndCountries] = useState<any[]>([]);

  const updateFlagAndCountries = async () => {
    const collectibleUpdate = [];
    if (!balance) return;
    const yourBalance = balance?.toNumber() ?? 0;
    for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
      try {
        console.log('Getting token index', tokenIndex);
        const tokenId = await flagAndCountry.tokenOfOwnerByIndex(ethersAppContext.account ?? '', tokenIndex);
        console.log('tokenId', tokenId.toNumber());
        const tokenURI = await flagAndCountry.tokenURI(tokenId);
        const tokenData = await axios.get(tokenURI);

        collectibleUpdate.push({ ...tokenData.data, id: tokenId, owner: `${ethersAppContext.account}` });

        console.log('tokenURI', tokenURI);
      } catch (e) {
        console.log(e);
      }
    }
    setFlagAndCountries(collectibleUpdate);
  };

  const mintFlag = async () => {
    if (!ethersAppContext.account) return;
    await flagAndCountry.mintFlag(ethersAppContext.account);
  };

  const handleMint = async () => {
    setMinting(true);
    await mintFlag();
    setMinting(false);
  };

  const handleTransfer = async (id: any) => {
    if (!ethersAppContext.account) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await flagAndCountry.transferFrom(ethersAppContext.account, transferToAddresses[id], id);
  };

  useEffect(() => {
    void updateFlagAndCountries();
  }, [ethersAppContext.account, balance]);

  return (
    <>
      <div style={{ width: 840, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <Button
          disabled={minting}
          shape="round"
          size="large"
          onClick={() => {
            void (async () => {
              await handleMint();
            })();
          }}>
          MINT NFT
        </Button>
      </div>
      <div style={{ width: 840, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          loading={minting}
          dataSource={FlagAndCountries}
          renderItem={(item: any) => {
            const id = item.id.toNumber();
            return (
              <List.Item key={`${id}_${item.uri}_${item.owner}`}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={item.image} style={{ maxWidth: 250 }} />
                  </div>
                  <div>{item.description}</div>
                </Card>

                <div style={{ width: 340, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
                  owner: <Address address={item.owner} blockExplorer={blockExplorer} fontSize={16} />
                  <AddressInput
                    placeholder="transfer to address"
                    address={transferToAddresses[id]}
                    onChange={(newValue) => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                    ensProvider={undefined}
                  />
                  <Button
                    onClick={() => {
                      async () => await handleTransfer(id);
                    }}>
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
