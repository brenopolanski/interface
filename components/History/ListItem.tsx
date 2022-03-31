import * as React from 'react';
import { UserHistoryFragment } from 'services/generated/graphql';
import Tooltip from 'components/Tooltip';
import { formatAddress } from 'utils/address';
import { CheckIcon, XIcon, PencilIcon, ArrowRightIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid';
import { useAccount } from 'wagmi';
import { MoreInfo } from './MoreInfo';
interface ItemProps {
  data: UserHistoryFragment;
}

function formatAmtPerSec(amtPerSec: number) {
  const formatted = amtPerSec.toString();
  if (formatted.length > 10) {
    return `${formatted.slice(0, 10)}...`;
  }
  return formatted;
}

export const ListItem = ({ data }: ItemProps) => {
  const [openInfo, setInfo] = React.useState(false);

  const [{ data: accountData }] = useAccount();
  const account = accountData?.address.toLowerCase();
  const eventType = data.eventType;
  const payer = data.stream.payer.id;
  const payee = data.stream.payee.id;
  const decimals = data.stream.token.decimals;
  const amtPerSec = data.stream.amountPerSec / 10 ** decimals;
  const oldAmtPerSec = data.oldStream?.amountPerSec / 10 ** decimals;
  let oldPayee = data.oldStream?.payee.id;
  let oldPayer = data.oldStream?.payer.id;

  if (oldPayer === undefined || oldPayee === undefined) {
    oldPayee = 'DNE';
    oldPayer = 'DNE';
  }

  const createdTime = new Date(data.createdTimestamp * 1000).toLocaleString('en-CA');

  return (
    <>
      <div className="mr-2 flex flex-1 items-center space-x-2">
        <div className="flex flex-1 items-center space-x-2">
          {eventType === 'StreamModified' ? (
            <Tooltip content="Modified Stream">
              <div className="rounded bg-yellow-100 p-1 text-yellow-600">
                <PencilIcon className="h-4 w-4" />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
          {eventType === 'StreamCreated' ? (
            <Tooltip content="Incoming stream">
              <div className="rounded bg-green-100 p-1 text-green-600">
                <CheckIcon className="h-4 w-4" />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
          {eventType === 'StreamCancelled' ? (
            <Tooltip content="Cancelled stream">
              <div className="rounded bg-red-100 p-1 text-red-600">
                <XIcon className="h-4 w-4" />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
          {eventType === 'StreamModified' ? (
            <>
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
                {account === oldPayee ? formatAddress(oldPayer) : 'You'}
              </span>
              <ArrowRightIcon className="h-4 w-4" />
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
                {account === oldPayer ? formatAddress(oldPayee) : 'You'}
              </span>
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]"> {formatAmtPerSec(oldAmtPerSec)}</span>
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
                {account === payee ? formatAddress(payer) : 'You'}
              </span>
              <ArrowRightIcon className="h-4 w-4" />
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
                {account === payer ? formatAddress(payee) : 'You'}
              </span>
              <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]"> {formatAmtPerSec(amtPerSec)}</span>
            </>
          )}
        </div>
        <div className="flex justify-end">
          <button onClick={() => setInfo(!openInfo)} className="rounded-lg bg-zinc-200 p-1 text-sm dark:bg-zinc-700">
            More Info
          </button>
          <MoreInfo
            isOpen={openInfo}
            setIsOpen={setInfo}
            eventType={eventType}
            payer={payer}
            payee={payee}
            amtPerSec={amtPerSec}
            oldAmtPerSec={oldAmtPerSec}
            oldPayer={oldPayee}
            oldPayee={oldPayee}
            createdTime={createdTime}
          />
        </div>
      </div>
      {eventType === 'StreamModified' ? (
        <div className="ml-8 flex flex-1 items-center space-x-2">
          <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
            {account === payee ? formatAddress(payer) : 'You'}
          </span>
          <ArrowRightIcon className="h-4 w-4" />
          <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]">
            {account === payer ? formatAddress(payee) : 'You'}
          </span>
          <span className="truncate sm:max-w-[32ch] md:max-w-[48ch]"> {formatAmtPerSec(amtPerSec)}</span>
        </div>
      ) : (
        ''
      )}
    </>
  );
};
