import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import useSUIWallet from '@/lib/useSUIWallet'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  const {address} = useSUIWallet()
  //console.log(address)
  const [open, setOpen] = useState(false);
  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef}
    >
      {address?
      <div className="relative flex flex-col w-full px-1 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-4">
        
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          style={{color:'white'}}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask IVAN"
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>:
      <div className="relative flex flex-col w-full px-1 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-4">
        
      <Textarea
        onClick={()=>{setOpen(true)}}
        style={{color:'white'}}
        placeholder="Ask IVAN"
        spellCheck={false}
        className="min-h-[60px] w-full resize-none bg-transparent py-[1.3rem] focus-within:outline-none sm:text-sm"
      />
      <ConnectModal
			trigger={
        <button disabled={!!address}> {address ? '' : ''}</button>
      }
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
		/>
  
    </div>
      }
    </form>
  )
}