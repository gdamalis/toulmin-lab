'use client'

import clsx from 'clsx'
import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { Link } from './Link'

const TableContext = createContext<{ bleed: boolean; dense: boolean; grid: boolean; striped: boolean }>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false,
})

export function Table({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  className,
  children,
  ...props
}: { bleed?: boolean; dense?: boolean; grid?: boolean; striped?: boolean } & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <TableContext.Provider value={{ bleed, dense, grid, striped } as React.ContextType<typeof TableContext>}>
      <div className="flow-root">
        <div {...props} className={clsx(className, '-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8')}>
          <div className={clsx('inline-block min-w-full py-2 align-middle', !bleed && 'sm:px-6 lg:px-8')}>
            <table className="min-w-full divide-y divide-gray-300">{children}</table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}

export function TableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={clsx(className)} />
}

export function TableBody(props: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} className="divide-y divide-gray-200" />
}

const TableRowContext = createContext<{ href?: string; target?: string; title?: string }>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function TableRow({
  href,
  target,
  title,
  className,
  ...props
}: { href?: string; target?: string; title?: string } & React.ComponentPropsWithoutRef<'tr'>) {
  const { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider value={{ href, target, title } as React.ContextType<typeof TableRowContext>}>
      <tr
        {...props}
        className={clsx(
          className,
          href &&
            'has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/2.5',
          striped && 'even:bg-zinc-950/2.5 dark:even:bg-white/2.5',
          href && striped && 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
          href && !striped && 'hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5'
        )}
      />
    </TableRowContext.Provider>
  )
}

export function TableHeader({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  const { bleed } = useContext(TableContext)

  return (
    <th
      {...props}
      className={clsx(
        className,
        'py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0',
        !bleed && 'sm:first:pl-0 sm:last:pr-0'
      )}
    />
  )
}

export function TableCell({ className, children, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  const { bleed } = useContext(TableContext)
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={clsx(
        className,
        'py-4 px-3 text-sm whitespace-nowrap',
        'relative',
        'first:pl-4 first:pr-3 last:pr-4 last:pl-3 sm:first:pl-0 sm:last:pr-0',
        !bleed && 'sm:first:pl-0 sm:last:pr-0'
      )}
    >
      {href && (
        <Link
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-hidden"
        />
      )}
      {children}
    </td>
  )
}
