import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import React from 'react'
import { cn } from '@/lib/utils'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconBot, IconUser } from '@/components/ui/icons'

import { Supply } from './Supply'
import { SwapCoins } from './SwapCoins'
import { Borrow } from './Borrow'
import { Portfolio } from './Portfolio'
import { Market } from './Market'
import { SingleAsset } from './SingleAsset'

export interface ChatMessageProps {
  message: Message,
  isLast: boolean
}

// Component mapping for dynamic rendering
const componentMap: Record<string, React.FC<any>> = {
  Supply,
  SwapCoins,
  Borrow,
  Portfolio,
  Market,
  SingleAsset
}

// Function to parse and render JSX-like strings as React components
function parseAndRenderComponents(content: string, isLast: boolean) {

  const regex = /<(\w+)\s*([^>]*)\/>/g;

  const elements: React.ReactNode[] = []
  let lastIndex = 0

  content.replace(regex, (match, tagName, attributes, offset) => {
    // Push preceding text
    if (offset > lastIndex) {
      elements.push(content.slice(lastIndex, offset))
    }
    
    // Find corresponding component
    const Component = componentMap[tagName]
    if (Component) {
      // Parse attributes into an object
      const props: Record<string, any> = {}
      attributes.replace(/(\w+)=['"]([^'"]+)['"]/g, (_, key, value) => {
        props[key] = isNaN(value as any) ? value : Number(value) // Convert numbers
      })
      if(!isLast && !['Portfolio','SingleAsset','Market'].includes(tagName)){
        elements.push(`[${tagName} Tool]`)
      }
      else{
        elements.push(<Component key={offset} {...props} />)
      }
      
    } else {
      elements.push(match) // Fallback to raw text if no matching component
    }

    lastIndex = offset + match.length
    return match
  })

  // Push remaining text
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex))
  }

  return elements
}

export function ChatMessage({ message, isLast, ...props }: ChatMessageProps) {
  //console.log(message.content)
  message.content = message.content.split('@@@@@')[0];

  const parsedContent = parseAndRenderComponents(message.content, isLast);

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
        {parsedContent.map((element, index) =>
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

