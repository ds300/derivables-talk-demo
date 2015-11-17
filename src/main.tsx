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

// number of columns which can be (fully) shown on page
const $numColumns = $WindowWidth.derive(divide, CELL_WIDTH)
                                .derive(Math.floor);

// create a cell for a particular index in [0..numColumns]
function makeCell (index) {
  const cell = <div className='header-cell'>{index}</div>;

  assign(cell.style, {
    width: px(CELL_WIDTH),
    height: px(CELL_HEIGHT),
    left: px(index * CELL_WIDTH),
    top: px(0)
  });

  return cell;
}

// react to changes in $numColumns, creating and removing
// header cells as the page is resized.
$numColumns.react(n => {
  const cells = header.children,
        len = cells.length;
  if (len < n) {
    // need more cells
    for (let i = len; i < n; i++) {
      header.appendChild(makeCell(i));
    }
  } else if (len > n) {
    // now have too many cells
    for (let i=len; i > n; i--) {
      cells[i-1].remove();
    }
  }
});




window.addEventListener('load', () => {
  document.body.appendChild(header)
  document.body.appendChild(slider)
});
