import { Scene } from "../scenes/Scene";
import { MenuOptionConfig } from "./MenuOptionConfig";

export type BasicMenuSceneConfig = {
    title: string;
    subTitle: string;
    menuItems: MenuOptionConfig[];
    nextScene?: string;
    oncreate?: (scene: Scene) => void;
    oncreated?: (scene: Scene) => void;
}