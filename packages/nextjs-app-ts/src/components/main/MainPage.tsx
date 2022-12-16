import { GenericContract } from 'eth-components/ant';
import { useEthersAdaptorFromProviderOrSigners } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { NextPage } from 'next';
import { ReactElement } from 'react';

import { FlagAndCountry } from './FlagAndCountry';

import { MainPageFooter, MainPageHeader, createTabsAndPages, TContractPageList } from '.';

import { useLoadAppContracts, useConnectAppContracts, useAppContracts } from '~common/components/context';
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification';
import { useBurnerFallback } from '~common/components/hooks/useBurnerFallback';
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders';
import { useScaffoldHooksExamples } from '~~/components/hooks/useScaffoldHooksExamples';
import {
  AVAILABLE_NETWORKS_DEFINITIONS,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  INFURA_ID,
  BURNER_FALLBACK_ENABLED,
} from '~~/config/nextjsApp.config';
import { TAppProps } from '~~/models/TAppProps';
import {} from 'eth-components';

/** ********************************
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See ./config/app.config.ts for configuration, such as TARGET_NETWORK
 * See ../common/src/config/appContracts.config.ts and ../common/src/config/externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See ../common/src/config/web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ******************************** */

interface IMainPageProps {
  pageName: string;
  children?: ReactElement;
  appProps: TAppProps;
}

/**
 * The main component
 * @returns
 */
export const MainPage: NextPage<IMainPageProps> = (props) => {
  // passed in by nextjs getInitalProps
  const appProps: TAppProps = props.appProps;

  const notificationHolder = useCreateAntNotificationHolder();

  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetworks: AVAILABLE_NETWORKS_DEFINITIONS,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    infuraId: INFURA_ID,
  });

  // 🦊 Get your web3 ethers context from current providers
  const ethersAppContext = useEthersAppContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext));

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:
  // 🚦 disable this hook to stop console logs
  // 🏹🏹🏹 go here to see how to use hooks!
  useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const yourContract = useAppContracts('YourContract', ethersAppContext.chainId);
  const flagAndCountry = useAppContracts('FlagAndCountry', ethersAppContext.chainId);

  const [ethPrice] = useDexEthPrice(
    scaffoldAppProviders.mainnetAdaptor?.provider,
    ethersAppContext.chainId !== 1 ? scaffoldAppProviders.currentTargetNetwork : undefined
  );

  const pageList: TContractPageList = {
    mainPage: {
      name: 'Flag And Country',
      content: (
        <FlagAndCountry
          mainnetProvider={MAINNET_PROVIDER}
          blockExplorer={scaffoldAppProviders.currentTargetNetwork.blockExplorer}
        />
      ),
    },
    pages: [
      {
        name: 'Smart-Contract',
        content: (
          <GenericContract
            contractName="Flag And Country"
            contract={flagAndCountry}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.currentTargetNetwork.blockExplorer}></GenericContract>
        ),
      },
    ],
  };
  const { tabMenu, pages } = createTabsAndPages(pageList);
  const RouteNotFound = <h3 className="p-10 mt-10 text-xl">Route Not Found </h3>;

  // -----------------------------
  // 📃 Render the react components
  // -----------------------------

  return (
    <div>
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} appProps={appProps} />
      <div>{tabMenu}</div>
      {pages[props.pageName] ?? RouteNotFound}
      <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} appProps={appProps} />
      <div className="absolute bg-slate-600">{notificationHolder}</div>
    </div>
  );
};
