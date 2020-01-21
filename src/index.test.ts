import { EventBus, defineEvent, createEventDefinition } from "./index";

const mockWarn = jest.fn();
console.warn = mockWarn;

describe("Basic usage", () => {
  describe("createEventDefinition", () => {
    it("should work with createEventDefinition", () => {
      // mock subscription
      const handleSubscription = jest.fn();

      const myEventCreator = createEventDefinition<{
        foo: string;
      }>()("myevent");

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

    describe("createEmptyEventDefinition", () => {
      it("should work with createEmptyEventDefinition and an empty payload", () => {
        // mock subscription
        const handleSubscription = jest.fn();

        const myEventCreator = createEventDefinition()("myevent");

        // create a bus
        const bus = new EventBus();
        bus.subscribe(myEventCreator, handleSubscription);

        // create n event
        const event = myEventCreator();

        // Call it once
        bus.publish(event);
        expect(handleSubscription.mock.calls).toEqual([
          [
            {
              type: "myevent",
              payload: undefined
            }
          ]
        ]);
      });
    });

    it("should show deprecation warning when using defineEvent", () => {
      mockWarn.mockReset();

      defineEvent<{
        type: "myevent";
        payload: { foo: string };
      }>("myevent");

      expect(mockWarn.mock.calls[0][0]).toEqual(
        "defineEvent is deprecated and will be removed in the future. Please use createEventDefinition instead."
      );
    });

    it("should allow runtime type warnings", () => {
      mockWarn.mockReset();
      const testFn = (o: any) => o.foo && typeof o.foo === "string";
      const myEventCreator = createEventDefinition<{
        foo: string;
      }>(testFn)("myevent");

      // @ts-ignore
      myEventCreator({ ding: "baz" });
      expect(mockWarn.mock.calls[0][0]).toEqual(
        `{"ding":"baz"} does not match expected payload.`
      );
    });

    it("should allow runtime type warnings with the options object", () => {
      mockWarn.mockReset();
      const testFn = (o: any) => o.foo && typeof o.foo === "string";
      const myEventCreator = createEventDefinition<{
        foo: string;
      }>({ test: testFn })("myevent");

      // @ts-ignore
      myEventCreator({ ding: "baz" });
      expect(mockWarn.mock.calls[0][0]).toEqual(
        `{"ding":"baz"} does not match expected payload.`
      );
    });

    it("should allow string coercion to return the eventType", () => {
      const myEventCreator = createEventDefinition<{
        foo: string;
      }>()("myevent");

      expect(String(myEventCreator)).toEqual("myevent");
    });
  });

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

  describe("multi subscription", () => {
    it("should subscribe to multiple events at once", () => {
      const handleSubscription = jest.fn();

      // create event creator
      type GreetEvent = {
        type: "greet";
        payload: { message: string };
      };

      const greetEvent = defineEvent<GreetEvent>("greet");
      const testFooEvent = defineEvent<{ type: "test.foo"; payload: string }>(
        "test.foo"
      );
      const otherEvent = defineEvent<{
        type: "notsubscribed";
        payload: string;
      }>("notsubscribed");
      const myTargetedEventType = "test.**";
      const bus = new EventBus();
      bus.subscribe([greetEvent, myTargetedEventType], handleSubscription);

      bus.publish(greetEvent({ message: "Hello!" })); // Should be subscribed
      bus.publish(testFooEvent("Foo")); // Should be subscribed
      bus.publish(otherEvent("Nope")); // Should not be subscribed

      expect(handleSubscription.mock.calls).toMatchObject([
        [{ type: "greet" }],
        [{ type: "test.foo" }]
      ]);
    });
  });

  describe("metadata", () => {
    it("should be able to send metadata", () => {
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
      bus.publish(event, { remote: true });
      expect(handleSubscription.mock.calls).toEqual([
        [
          {
            type: "myevent",
            payload: { foo: "Hello" },
            meta: { remote: true }
          }
        ]
      ]);
    });
  });
  it("should be able to append metadata", () => {
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
    bus.publish(
      { ...event, meta: { remote: false, thing: "foo" } },
      { remote: true }
    );
    expect(handleSubscription.mock.calls).toEqual([
      [
        {
          type: "myevent",
          payload: { foo: "Hello" },
          meta: { remote: true, thing: "foo" }
        }
      ]
    ]);
  });
});

describe("namespaced events", () => {
  it("should handle namespaced events", () => {
    // mock subscription
    const handleAllSubscriptions = jest.fn();
    const handleThingsSubscriptions = jest.fn();

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

    type Frogs = {
      type: "frogs";
      payload: string;
    };
    const createFrogs = defineEvent<Frogs>("frogs");

    const bus = new EventBus();
    bus.subscribe("**", handleAllSubscriptions);
    bus.subscribe("things.*", handleThingsSubscriptions);

    bus.publish(createEditEvent("Foo"));
    bus.publish(createSaveEvent("Bar"));
    bus.publish(createFrogs("Gribbit"));

    expect(handleAllSubscriptions.mock.calls).toEqual([
      [{ payload: "Foo", type: "things.edit" }],
      [{ payload: "Bar", type: "things.save" }],
      [{ payload: "Gribbit", type: "frogs" }]
    ]);
    expect(handleThingsSubscriptions.mock.calls).toEqual([
      [{ payload: "Foo", type: "things.edit" }],
      [{ payload: "Bar", type: "things.save" }]
    ]);
  });
});
describe("filtering by predicate", () => {
  it("should filter event subscription using a predicate function", () => {
    // mock subscription
    const handleAllSubscriptions = jest.fn();
    const handleThingsSubscriptions = jest.fn();

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

    type Frogs = {
      type: "frogs";
      payload: string;
    };
    const createFrogs = defineEvent<Frogs>("frogs");

    const bus = new EventBus();
    bus.subscribe(() => true, handleAllSubscriptions);
    bus.subscribe(
      ({ type }) => /^things\./.test(type),
      handleThingsSubscriptions
    );

    bus.publish(createEditEvent("Foo"));
    bus.publish(createSaveEvent("Bar"));
    bus.publish(createFrogs("Gribbit"));

    expect(handleAllSubscriptions.mock.calls).toEqual([
      [{ payload: "Foo", type: "things.edit" }],
      [{ payload: "Bar", type: "things.save" }],
      [{ payload: "Gribbit", type: "frogs" }]
    ]);
    expect(handleThingsSubscriptions.mock.calls).toEqual([
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
