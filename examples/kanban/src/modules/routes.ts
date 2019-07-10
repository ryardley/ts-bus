import board from "./board/routes";
import playground from "./ui/routes";

export type ApplicationRoutes = {
  [path: string]: {
    label: string;
    exact?: boolean;
    component: React.ComponentType<any>;
  };
};

export default {
  ...board,
  ...playground
} as ApplicationRoutes;
