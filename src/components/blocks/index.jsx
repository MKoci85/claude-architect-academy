import { BlockText } from './BlockText';
import { BlockCode } from './BlockCode';
import { BlockCallout } from './BlockCallout';
import { BlockCards } from './BlockCards';
import { BlockTable } from './BlockTable';
import { BlockSteps } from './BlockSteps';
import { BlockStats } from './BlockStats';
import { BlockCompare } from './BlockCompare';

export function Block({ block, highlightTerm }) {
  switch (block.type) {
    case 'text':    return <BlockText block={block} highlightTerm={highlightTerm} />;
    case 'code':    return <BlockCode block={block} />;
    case 'callout': return <BlockCallout block={block} highlightTerm={highlightTerm} />;
    case 'cards':   return <BlockCards block={block} />;
    case 'table':   return <BlockTable block={block} />;
    case 'steps':   return <BlockSteps block={block} />;
    case 'stats':   return <BlockStats block={block} />;
    case 'compare': return <BlockCompare block={block} />;
    default:        return null;
  }
}
