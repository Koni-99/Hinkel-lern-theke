// Jedes Element der App läuft hier durch: so werden die Farben an einer Stelle umgerechnet (siehe farben.ts).
import * as R from 'react/jsx-runtime';
import { themaProps, schriftProps } from './farben';
import { NACHT } from './modus';
const wandle = NACHT ? themaProps : schriftProps;
const r = R as any;
export const Fragment = r.Fragment;
export const jsx = (type: any, props: any, key?: any) => r.jsx(type, typeof type === 'string' && props && props.style ? wandle(props) : props, key);
export const jsxs = (type: any, props: any, key?: any) => r.jsxs(type, typeof type === 'string' && props && props.style ? wandle(props) : props, key);
