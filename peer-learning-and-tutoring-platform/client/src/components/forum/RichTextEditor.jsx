import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Code, Quote } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...', height = '200px' }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertText('[', `](${url})`);
    }
  };

  const insertCodeBlock = () => {
    insertText('```\n', '\n```');
  };

  const insertQuote = () => {
    insertText('> ');
  };

  const renderPreview = () => {
    // Simple markdown to HTML conversion
    let html = value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded overflow-x-auto"><code>$1</code></pre>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\-\s+(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br>');

    return { __html: html };
  };

  const getCharCount = () => value.length;
  const getWordCount = () => value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('__', '__')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertText('- ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('1. ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('`', '`')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertCodeBlock}
          className="p-2 hover:bg-gray-200 rounded"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertQuote}
          className="p-2 hover:bg-gray-200 rounded"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1 rounded text-sm ${
            isPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor/Preview */}
      <div style={{ height }}>
        {isPreview ? (
          <div className="p-4 overflow-y-auto h-full bg-white">
            {value ? (
              <div 
                className="prose max-w-none prose-sm"
                dangerouslySetInnerHTML={renderPreview()}
              />
            ) : (
              <div className="text-gray-500 italic">Nothing to preview</div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 resize-none focus:outline-none"
            style={{ height }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-between items-center text-xs text-gray-600">
        <div className="flex gap-4">
          <span>{getCharCount()} characters</span>
          <span>{getWordCount()} words</span>
        </div>
        <div className="text-gray-500">
          Markdown supported
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
