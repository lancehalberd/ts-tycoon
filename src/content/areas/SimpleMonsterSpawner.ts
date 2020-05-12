import {
    initializeActorForAdventure,
} from 'app/character';
import { isPointOverAreaTarget } from 'app/content/areas';
import { makeMonster } from 'app/content/monsters';
import {
    ADVENTURE_WIDTH,
    FRAME_LENGTH,
    GROUND_Y,
} from 'app/gameConstants';
import { getFrame, drawFrame } from 'app/utils/animations';
import { ifdefor } from 'app/utils/index';

import {
    Actor, FrameAnimation, Area, AreaEntity, AreaObject, AreaObjectTarget,
    AreaType, FixedObject, Frame, Hero, MonsterSpawn, MonsterSpawner,
} from 'app/types';

export class SimpleMonsterSpawner implements MonsterSpawner {
    area: Area;
    x: number;
    y: number;
    z: number;
    isSolid: boolean = false;
    proximity = ADVENTURE_WIDTH / 3;
    spawns: Partial<MonsterSpawn & {delay?: number}>[];
    time: number;
    lastSpawnTime: number;
    spawnTimer: number;
    spawnAnimation: FrameAnimation;

    constructor(spawns: MonsterSpawn[], initialDelay: number, delay: number, animation: FrameAnimation) {
        this.spawns = spawns.map(spawn => ({...spawn, delay}));
        this.spawnAnimation = animation;
        this.lastSpawnTime = 0;
        this.spawnTimer = initialDelay;
    }

    getCurrentFrame(): Frame {
        return getFrame(this.spawnAnimation, Math.max(0, -this.spawnTimer));
    }

    getAreaTarget(): AreaObjectTarget {
        const frame = this.getCurrentFrame();
        const content = frame.content || frame;
        return {
            area: this.area,
            targetType: 'object',
            object: this,
            x: this.x,
            y: this.y,
            z: this.z,
            w: content.w,
            h: content.x,
            d: ifdefor(content.d, ifdefor(frame.d, content.w)),
        };
    }
    isPointOver(x, y) {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y);
    }
    move(dx: number, dy: number, dz: number) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }

    update() {
        // Do nothing once all monsters are spawned.
        if (!this.spawns.length) {
            return;
        }
        this.time += FRAME_LENGTH;
        // Do nothing if the hero is not in range.
        if (Math.abs(this.x - this.area.allies.find(actor => actor.type === 'hero').x) > this.proximity) {
            return;
        }
        this.spawnTimer -= FRAME_LENGTH;
        if (this.spawnTimer <= -this.spawnAnimation.duration) {
            // spawn the monster.
            const monsterData = this.spawns.shift();
            const bonusSources = [...(monsterData.bonusSources || []), ...this.area.enemyBonuses];
            const rarity = monsterData.rarity;
            const newMonster = makeMonster(this.area, monsterData.key, monsterData.level, bonusSources, rarity);
            newMonster.heading = [-1, 0, 0]; // Monsters move right to left
            newMonster.x = this.x;
            newMonster.y = this.y;
            newMonster.z = this.z;
            newMonster.area = this.area;
            initializeActorForAdventure(newMonster);
            newMonster.time = 0;
            newMonster.allies = newMonster.area.enemies;
            newMonster.enemies = newMonster.area.allies;
            newMonster.allies.push(newMonster);

            this.lastSpawnTime = this.time;
            if (this.spawns.length) {
                this.spawnTimer = this.spawns[0].delay;
            }
        } else if (this.spawnTimer > 0 && this.area.enemies.filter(e => !e.isDead).length === 0) {
            this.spawnTimer = 0;
        }
    }

    render(context: CanvasRenderingContext2D) {
        const frame = this.getCurrentFrame();
        const content = frame.content || frame;
        context.save();
            context.translate(
                this.x + content.w / 2 - this.area.cameraX,
                GROUND_Y - content.h - this.z / 2
            );
            context.scale(-1, 1);
            drawFrame(context, frame, {...frame, x: 0, y: 0});
        context.restore();
    }
}