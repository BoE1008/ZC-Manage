import React from "react";
import ReactDOM from "react-dom";
import { Table } from "antd";
import type { TableProps } from "antd";

// 表头单元格自定义扩展属性（列宽拖拽用）
interface ResizableCell extends HTMLTableCellElement {
  mouseDown?: boolean;
  oldX?: number;
  oldWidth?: number;
}

class ResizeTable extends React.Component<TableProps<any>> {
  private table: HTMLTableElement | null;
  private column: ResizableCell | null;
  private tableWidth: number;

  constructor(props: TableProps<any>) {
    super(props);

    this.table = null;
    this.column = null;
    this.tableWidth = 0;
  }

  componentDidMount() {
    const el = ReactDOM.findDOMNode(this) as HTMLElement | null;
    if (!el) return;
    const table = el.getElementsByTagName("table")[0];
    if (!table) return;
    this.table = table;
    table.setAttribute("data-table-resizable", "true");
    table.id = "rs_tb";
    this.resizeable();
    this.clearColumnsWidth();
  }

  resizeable() {
    if (!this.table || !this.table.rows[0]) return;
    const header = this.table.rows[0];
    const cells = header.cells;
    const len = cells.length;

    for (let i = 0; i < len; i++) {
      cells[i].addEventListener("mousedown", this.handleMousedown);
      cells[i].addEventListener("mousemove", this.handleMousemove, true);
    }
    this.table.addEventListener("mouseup", this.handleMouseup);
  }

  handleMousedown = (event: MouseEvent) => {
    const target = event.currentTarget as ResizableCell;
    this.column = target;
    if (event.offsetX > target.offsetWidth - 10) {
      target.mouseDown = true;
      target.oldX = event.x;
      target.oldWidth = target.offsetWidth;
    }
    if (this.table && this.table.rows[0]) {
      this.tableWidth = this.table.rows[0].clientWidth;
    }
  };

  handleMousemove = (event: MouseEvent) => {
    const target = event.currentTarget as ResizableCell;
    if (event.offsetX > target.offsetWidth - 10) {
      target.style.cursor = "col-resize";
    } else {
      target.style.cursor = "default";
    }
    if (!this.column) {
      this.column = target;
    }
    const column = this.column;
    if (column.mouseDown) {
      column.style.cursor = "default";
      const diff = event.x - (column.oldX ?? 0);
      if (column.oldWidth !== undefined && column.oldWidth + (event.x - column.oldX!) > 0) {
        (column as any).width = column.oldWidth + diff;
      }

      column.style.width = String(column.width);
      if (this.table) {
        this.table.style.width = this.tableWidth + diff + "px";
      }
      column.style.cursor = "col-resize";
    }
  };

  handleMouseup = () => {
    if (this.column) {
      this.column.mouseDown = false;
      this.column.style.cursor = "default";
    }
  };

  clearColumnsWidth() {
    if (!this.table) return;
    const colgroup = Array.from(this.table.children).find(
      (n) => (n as HTMLElement).tagName === "COLGROUP",
    ) as HTMLTableColElement | undefined;
    if (colgroup) {
      const cols = Array.from(colgroup.children) as HTMLElement[];
      cols.forEach((node) => {
        node.style.width = "auto";
      });
    }
  }

  render() {
    return <Table {...this.props} />;
  }
}

export default ResizeTable;
