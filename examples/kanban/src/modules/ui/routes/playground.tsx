import React from "react";
import Button from "../Button";
import Icon from "../Icon";

export default () => (
  <div>
    <h1>Playground</h1>
    <div>
      <h2>Button</h2>
      <Button kind="primary">Hello</Button>
      <br />
      <Button kind="link">Hello</Button>
      <br />
      <Button prefix={<Icon icon="Plus" size="small" />} kind="primary">
        Hello
      </Button>
      <br />
      <Button kind="primary" size="large">
        Hello
      </Button>

      <br />
      <Button prefix={<Icon icon="Plus" />} kind="primary" size="large">
        Hello
      </Button>
    </div>
  </div>
);
