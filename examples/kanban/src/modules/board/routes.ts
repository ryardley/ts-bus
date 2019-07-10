import BoardPage from "./routes/main";

export default {
  "/": { label: "Board", exact: true, component: BoardPage },
  "/card/:cardId/edit": { label: "Edit Card", component: BoardPage }
};
