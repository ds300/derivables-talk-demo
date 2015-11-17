import {
  React,
  assign,
  add,
  mul,
  sub,
  divide,
  px
} from './utils'

import { atom, transaction } from 'derivable'

const $WindowWidth = atom(window.innerWidth);
const $WindowHeight = atom(window.innerHeight);
window.addEventListener('resize', transaction(() => {
  $WindowWidth.set(window.innerWidth);
  $WindowHeight.set(window.innerHeight);
}));

const $MouseX = atom(0);
window.addEventListener('mousemove', e => {
  $MouseX.set(e.pageX);
});

const header = <div className='header'></div>;
const slider = <div className='slider'></div>;

const CELL_WIDTH = 100;
const CELL_HEIGHT = 20;
const SLIDER_BREADTH = 10;








window.addEventListener('load', () => {
  document.body.appendChild(header)
  document.body.appendChild(slider)
});
