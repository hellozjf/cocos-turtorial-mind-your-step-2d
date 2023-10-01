import { _decorator, Component, EventMouse, Input, input, Node, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;

// 添加一个放大比
export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(Animation)
    BodyAnim: Animation = null;

    // 是否开始跳跃：用于判断角色是否在跳跃状态
    private _startJump: boolean = false;
    // 跳跃步数：一步或者两步，用于记录鼠标的输入，并将其转化为数值。因为我们规定角色最多只能跳两步，那么他可能是 1 或者 2
    private _jumpStep: number = 0;
    // 当前的跳跃时间：每次跳跃前，将这个值置为0，在更新时进行累计并和 _jumpTime 进行对比，如果超过了 _jumpTime，那么我们认为角色完成了一次完整的跳跃
    private _curJumpTime: number = 0;
    // 跳跃时间：这个数值类型的变量用于记录整个跳跃的时长
    private _jumpTime: number = 0.1;
    // 移动速度：用于记录跳跃时的移动速度
    private _curJumpSpeed: number = 0;
    // 当前的位置：记录和计算角色的当前位置
    private _curPos: Vec3 = new Vec3();
    // 位移：每一帧我们都需要记录下位置和时间间隔的乘积，我们将用它来存储计算结果
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    // 目标位置：最终的落点，我们将在跳跃结束时将角色移动这个位置以确保最终的位置正确，这样可以处理掉某些误差的情况
    private _targetPos: Vec3 = new Vec3();

    start() {
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    update(deltaTime: number) {
        if (this._startJump) {
            // 累计总的跳跃时间
            this._curJumpTime += deltaTime;

            // 判断跳跃时间是否结束
            if (this._curJumpTime > this._jumpTime) {
                // 跳跃已经结束
                // 强制位置到终点
                this.node.setPosition(this._targetPos);
                // 清理跳跃标记
                this._startJump = false;
            } else {
                // 跳跃还没有结束
                this.node.getPosition(this._curPos);
                // 每一帧根据速度和时间计算位移
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                // 应用这个位移
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                // 将位移设置给角色
                this.node.setPosition(this._curPos);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            // 鼠标左键被按下
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            // 鼠标右键被按下
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }

        // 标记开始跳跃
        this._startJump = true;
        // 跳跃的步数 1 或者 2
        this._jumpStep = step;
        // 重置开始跳跃的时间
        this._curJumpTime = 0;

        // 获取动画播放时长，动态调整跳跃时间
        const clipName = step == 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this._jumpTime = state.duration;

        // 根据时间计算出速度
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime;
        // 获取角色当前的位置
        this.node.getPosition(this._curPos);
        // 计算出目标位置
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0));

        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }
    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    reset() {}
}


