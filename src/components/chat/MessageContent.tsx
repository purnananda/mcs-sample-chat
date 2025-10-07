interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  // Function to format the message content
  const formatContent = (text: string) => {
    // Split by line breaks and process each line
    const lines = text.split('\n');
    
    return lines.map((line) => {
      // Skip completely empty lines but preserve intentional spacing
      if (line.trim() === '') {
        return '<div style="height: 12px;"></div>';
      }

      // Handle bold text (**text**)
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle headers (### text)
      if (line.startsWith('###')) {
        formattedLine = `<h3 style="font-weight: bold; margin: 12px 0 8px 0; font-size: 1.15em; color: #374151;">${line.replace(/###\s*/, '')}</h3>`;
      }
      // Handle separators (---)
      else if (line.trim() === '---') {
        formattedLine = '<hr style="margin: 12px 0; border: none; border-top: 1px solid #e5e7eb;" />';
      }
      // Handle list items (- text or • text)
      else if (line.trim().match(/^[-•]\s+/)) {
        const listContent = formattedLine.replace(/^\s*[-•]\s*/, '');
        formattedLine = `<div style="margin: 6px 0; padding-left: 18px; position: relative; line-height: 1.6;">
          <span style="position: absolute; left: 0; color: #6b7280; font-weight: bold;">•</span>
          <span>${listContent}</span>
        </div>`;
      }
      // Regular paragraph line
      else if (formattedLine.trim()) {
        formattedLine = `<div style="margin: 6px 0; line-height: 1.6;">${formattedLine}</div>`;
      }
      
      return formattedLine;
    }).join('');
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      style={{ 
        lineHeight: '1.6',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        fontSize: '14px'
      }}
    />
  );
}