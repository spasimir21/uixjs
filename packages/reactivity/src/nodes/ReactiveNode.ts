import { $RAW, markReactive } from '../flags';

class ReactiveNode {
  get [$RAW]() {
    return this;
  }

  constructor() {
    markReactive(this);
  }

  public validate() {}
}

export { ReactiveNode };
