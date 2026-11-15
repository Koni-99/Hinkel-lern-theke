// Wie jsx-runtime.ts, nur für den Entwicklungs-Modus (npm run dev)
import * as R from 'react/jsx-dev-runtime';
import { themaProps, schriftProps } from './farben';
import { NACHT } from './modus';
const wandle = NACHT ? themaProps : schriftProps;
const r = R as any;
export const Fragment = r.Fragment;
export const jsxDEV = (type: any, props: any, key: any, statisch: any, quelle: any, selbst: any) => r.jsxDEV(type, typeof type === 'string' && props && props.style ? wandle(props) : props, key, statisch, quelle, selbst);
