import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import React from 'react'
import { cn } from '@/lib/utils'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconBot, IconUser } from '@/components/ui/icons'


export interface ChatMessageProps {
  message: Message,
  isLast: boolean
}


export function ChatMessage({ message, isLast, ...props }: ChatMessageProps) {
  //console.log(message.content)

  return (
    <div className={cn('group relative mb-4 flex items-start md:-ml-12')} {...props}>
      <div
        className={cn(
          'flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user' ? 'bg-background' : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconBot />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {[message].map((element, index) =>
          typeof element === 'string' ? (
            <MemoizedReactMarkdown
              key={index}
              className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
              remarkPlugins={[remarkGfm, remarkMath]}
              components={{
                p({ children }) {
                  return <p style={{color:"#d1d5db"}} className="mb-2 last:mb-0">{children}</p>;
                },
              }}
            >
              {element}
            </MemoizedReactMarkdown>
          ) : (
            <React.Fragment key={index}>{element}</React.Fragment>
          )
        )}
      </div>
    </div>
  );
}

