import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // Keep pre tag, apply styling if needed
  pre: ({ node, children, ...props }) => (
    <pre className="not-prose text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl mb-4" {...props}>
      {/* Render children which should include the <code> element */}
      {children}
    </pre>
  ),
  // Use CodeBlock specifically for the code element INSIDE pre
  // Let react-markdown handle inline code normally unless customization needed
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match) {
      // It's a block code element within a pre
      // We can pass the language to CodeBlock if needed, or let CodeBlock handle it
      // Here, we just render the raw children, because the <pre> above handles styling and layout
      // Or, if CodeBlock needs to handle syntax highlighting based on language:
      // return <CodeBlock node={node} inline={inline} className={className} {...props}>{children}</CodeBlock>;
      // Simplified: let the <pre> handle styling, render raw code inside
      return <code className={className ?? ''} {...props}>{children}</code>;
    } else if (inline) {
        // Handle inline code - use CodeBlock's inline styling logic
        return <CodeBlock node={node} inline={inline} className={className ?? ''} {...props}>{children}</CodeBlock>;
    }
    // Default rendering for other cases or non-highlighted blocks
    return <code className={className ?? ''} {...props}>{children}</code>;
  },
  // Ensure p doesn't render around block elements if possible, though this is tricky
  // and often depends on the markdown source and remark plugins.
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
