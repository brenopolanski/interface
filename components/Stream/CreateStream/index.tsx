import * as React from 'react';
import Placeholder from './Placeholder';
import ErrorBoundary from './ErrorBoundary';
import { useBalances } from 'hooks';
import { useAccount } from 'wagmi';
import { StreamIcon } from 'components/Icons';
import useTokenBalances from 'queries/useTokenBalances';
import CreateMultipleStreams from './CreateMultipleStreams';

export const CreateStream = () => {
  const [{ loading: accountDataLoading }] = useAccount();

  const { isLoading, isError } = useBalances();

  const { data: tokens, isLoading: tokenBalancesLoading, isError: tokenBalancesError } = useTokenBalances();

  const loading = accountDataLoading || isLoading || tokenBalancesLoading;

  const error = isError || tokenBalancesError || !tokens;

  return (
    <section className="z-2 flex w-full max-w-lg flex-col">
      <h1 className="font-exo mb-5 flex items-center gap-[0.625rem] text-2xl font-semibold text-[#3D3D3D]">
        <StreamIcon />
        <span>Create a New Stream</span>
      </h1>
      {loading ? (
        <Placeholder />
      ) : error ? (
        <ErrorBoundary message="Something went wrong" />
      ) : (
        <CreateMultipleStreams tokens={tokens} />
      )}
    </section>
  );
};
