/**
 * Generic queue class for event management.
 */
class CQueue<Type> {
    constructor(capacity: number) {
        this._queue = new Array<Type>(capacity);
        this._capacity = capacity;
        this._size = 0;
        this._front = 0;
    }

    // private vars for the queue functionality
    private readonly _queue: Array<Type>;
    private readonly _capacity: number;
    private _size: number;
    private _front: number;

    /**
     * Returns true or false depending on if the size is zero.
     * @private
     */
    private isSizeZero(): boolean {
        return this._size === 0;
    }

    /**
     * Returns true or false depending on if the size is equal to the capacity.
     * @private
     */
    private isQueueFull(): boolean {
        return this._size === this._capacity;
    }

    /**
     * Attempts to get the first item in the queue.
     * @return An item in the queue or null if the queue is empty.
     */
    public getFront(): Type | null {
        if (this.isSizeZero()) return null;
        return this._queue[this._front];
    }

    /**
     * Attempts to get the last item in the queue.
     * @return An item in the queue or null if the queue is empty.
     */
    public getRear(): Type | null {
        if (this.isSizeZero()) return null;
        const rear = (this._front + this._size - 1) % this._capacity;
        return this._queue[rear];
    }

    /**
     * Attempts to add an item to the back of the queue. Fails if the queue is full.
     * @param item Item to attempt to add to the queue.
     */
    public queueItem(item: Type) {
        if (this.isQueueFull()) return;
        const rear = (this._front + this._size) % this._capacity;
        this._queue[rear] = item;
        this._size++;
    }

    /**
     * Attempts to remove an item from the front of the queue. Fails if the queue is empty.
     * @return An item in the queue or null if the queue is empty.
     */
    public dequeueItem(): Type | null {
        if (this.isSizeZero()) return null;
        const item = this._queue[this._front];
        this._front = (this._front + 1) % this._capacity;
        this._size--;
        return item;
    }
}