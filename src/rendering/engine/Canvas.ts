import { type Object, type ObjectData, ObjectType } from "./objects/Object";
import { Circle } from "./objects/Circle";
import { Illustration } from "./objects/Illustration";

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 400;

/**
 * turn object data into objects
 */
const initializeObjects = (objects: ObjectData[], canvas: Canvas): Object[] => {
  return objects.map((object) => {
    if (object.type === ObjectType.Circle) {
      return new Circle(object, canvas);
    }
    if (object.type === ObjectType.Illustration) {
      return new Illustration(object, canvas);
    }
    throw new Error(`Unknown object type ${object.type}`);
  });
};

export class Canvas {
  private canvasElement: HTMLCanvasElement;
  private objects: Object[];
  viewport = {
    top: 0,
    left: 0,
  };
  private dpr: number;
  protected static ctx: CanvasRenderingContext2D | null = null;
  protected static isValid = true;

  constructor(canvasElement: HTMLCanvasElement, objects: ObjectData[] = []) {
    this.canvasElement = canvasElement;
    this.objects = initializeObjects(objects, this);

    this.dpr = window.devicePixelRatio ?? 1;
    this.canvasElement.setAttribute("width", `${CANVAS_WIDTH * this.dpr}`);
    this.canvasElement.setAttribute("height", `${CANVAS_HEIGHT * this.dpr}`);
    this.setCtx();
  }

  setCtx() {
    const ctx = this.canvasElement.getContext("2d");
    if (ctx === null) {
      Canvas.isValid = false;
      throw new Error("Could not get canvas context");
    } else {
      ctx.scale(this.dpr, this.dpr);
      Canvas.ctx = ctx;
    }
  }
  /**
   * update the color of an object
   */
  updateColor(objectId: number, color: string): void {
    const object = this.objects.find((object) => object.id === objectId);
    if (!object) {
      throw new Error(`Could not find object with id ${objectId}`);
    }
    object.setColor(color);
  }

  /**
   * clear the canvas element
   */
  public clear(ctx?: CanvasRenderingContext2D | null): void {
    ctx = ctx ?? Canvas.ctx;
    if (!Canvas.isValid || !ctx) {
      throw new Error("Could not get canvas context");
    }

    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    ctx.restore();
  }

  /**
   * set the viewport of the canvas
   */
  setViewport(top: number, left: number): void {
    this.viewport = {
      top,
      left,
    };
  }

  /**
   * get all objects
   */
  getObjects(): Object[] {
    return this.objects;
  }

  /**
   * render all objects on the canvas
   */
  async render(): Promise<void> {
    if (!Canvas.ctx) {
      throw new Error("Could not get canvas context");
    }

    // clear the canvas from the last render
    this.clear(Canvas.ctx);

    // render all objects
    for (const object of this.objects) {
      await object.render(Canvas.ctx);
    }
  }
}
