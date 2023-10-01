import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    // 开始的 UI
    @property({ type: Node })
    public startMenu: Node | null = null;

    // 角色控制器
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;

    // 计步器
    @property({ type: Label })
    public stepsLabel: Label | null = null;

    private _road: BlockType[] = [];

    start() {
        this.init();
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();

        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    play() {
        if (this.startMenu) {
            this.startMenu.active = false;
        }

        if (this.stepsLabel) {
            // 将步数重置为 0
            this.stepsLabel.string = '0';
        }

        setTimeout(() => {
            // 直接设置 active 会直接开始监听鼠标事件，做了一下延迟处理
            if (this.playerCtrl) {
                this.playerCtrl.setInputActive(true);
            }
        }, 0.1);
    }

    update(deltaTime: number) {
        
    }

    generateRoad() {

        this.node.removeAllChildren();

        this._road = [];

        // 开始位置
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                // 如果上一个位置是坑的话，那么这个位置必须是石头
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }
        return block;
    }

    setCurState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.play();
                break;
            case GameState.GS_END:
                break;
        }
    }

    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }
}


