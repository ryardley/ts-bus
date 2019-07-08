import { EventBus, defineEvent } from "./index";

describe("Basic usage", () => {
  it("should respond to events being dispatched", () => {
    // mock subscription
    const handleSubscription = jest.fn();

    // create event creator
    type MyEvent = {
      type: "myevent";
      payload: { foo: string };
    };

    const myEventCreator = defineEvent<MyEvent>("myevent");

    // create a bus
    const bus = new EventBus();
    bus.subscribe(myEventCreator, handleSubscription);

    // create n event
    const event = myEventCreator({ foo: "Hello" });

    // Call it once
    bus.publish(event);
    expect(handleSubscription.mock.calls).toEqual([
      [
        {
          type: "myevent",
          payload: { foo: "Hello" }
        }
      ]
    ]);

    // call a few times
    bus.publish(event);
    bus.publish(event);
    bus.publish(event);

    expect(handleSubscription.mock.calls.length).toBe(4);
  });
});

describe("namespaced events", () => {
  it("should handle namespaced events", () => {
    // mock subscription
    const handleSubscription = jest.fn();

    type ThingsSave = {
      type: "things.save";
      payload: string;
    };
    const createSaveEvent = defineEvent<ThingsSave>("things.save");

    type ThingsEdit = {
      type: "things.edit";
      payload: string;
    };
    const createEditEvent = defineEvent<ThingsEdit>("things.edit");

    const bus = new EventBus();
    bus.subscribe("things.*", handleSubscription);

    bus.publish(createEditEvent("Foo"));
    bus.publish(createSaveEvent("Bar"));

    expect(handleSubscription.mock.calls).toEqual([
      [{ payload: "Foo", type: "things.edit" }],
      [{ payload: "Bar", type: "things.save" }]
    ]);
  });
});

describe("unsubsubscribe from events", () => {
  it("should handle unsubscribing", () => {
    // mock subscription
    const handleSubscription = jest.fn();

    // create event creator
    type MyEvent = {
      type: "myevent";
      payload: { foo: string };
    };

    const myEventCreator = defineEvent<MyEvent>("myevent");

    // create a bus
    const bus = new EventBus();
    const unsubscribe = bus.subscribe(myEventCreator, handleSubscription);

    // create n event
    const event = myEventCreator({ foo: "Hello" });

    // publish event
    bus.publish(event);
    unsubscribe();

    // subsequent calls should not fire
    bus.publish(event);
    bus.publish(event);

    expect(handleSubscription.mock.calls.length).toBe(1);
  });
});
