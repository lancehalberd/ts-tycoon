import { Area, Frame, ShortRectangle } from 'app/types';

export interface CanvasPopupTarget {
    isPointOver: (x: number, y: number) => boolean,
    isVisible?: () => boolean,
    onClick?: () => void,
    onMouseOut?: () => void,
    helpMethod?: () => string,
    helpText?: string,
    // These are only set on actors.
    isDead?: boolean,
    area?: Area,
    targetType?: string,
    getAreaTarget?: Function,
    onInteract?: Function,
}

export interface HudButton extends CanvasPopupTarget {
    render?: (context: CanvasRenderingContext2D) => void,
}

export interface HudFrameButton extends HudButton {
    frame: Frame,
    target: ShortRectangle,
    flashColor?: string,
    render?: (context: CanvasRenderingContext2D) => void,
}