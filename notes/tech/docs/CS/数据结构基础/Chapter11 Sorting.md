所有突破 $O(N^2)$ 瓶颈的高级排序算法的共同思想：“**先让局部的元素有序，再让更大范围内的元素有序**”的渐进式排序。
## Selection Sort 选择排序
选择排序的核心思想是：将待排序序列分为**已排序区间**和**未排序区间**。每次从未排序区间中找到最小（或最大）的元素，将其与未排序区间的第一个元素进行交换，从而使已排序区间增加一个元素，直至整个序列有序。

### 步骤
1. 初始状态下，整个序列为未排序区间：`[0, n-1]`。
2. 在未排序区间中，通过遍历找到最小元素的下标 minIndex。
3. 将该最小元素与未排序区间的首个元素交换位置。
4. 将未排序区间的起始边界向后移动一位，重复步骤 2~3，直到未排序区间只剩一个元素。

```C
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; ++i) {
        int minIndex = i; // 记录从未排序区间中找到的最小元素的下标
        for (int j = i + 1; j < n; ++j) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j; // 更新最小值下标
            }
        }
        // 将找到的最小值交换到未排序区间的首位
        if (minIndex != i) {
            std::swap(arr[i], arr[minIndex]);
        }
    }
}
```

### 性能分析
* **时间复杂度**：
  * **最好、最坏、平均情况**：均为 $O(n^2)$。无论初始状态如何，算法都需要执行双重循环进行比较（比较次数固定为 $\frac{n(n-1)}{2}$ 次）。
* **空间复杂度**：$O(1)$。仅需常数级别的辅助变量（原地排序）。
* **稳定性**：不稳定。在交换过程中，可能会破坏相同元素的相对顺序。例如，序列 `[5, 8, 5, 2, 9]`，在第一趟中最小元素 `2` 会与第一个 `5` 交换，从而使第一个 `5` 跑到了第二个 `5` 的后面。
* **在链式结构（链表）下的表现**：
  * **可行性**：可以通过顺序遍历链表寻找最小值节点，然后通过修改指针（或直接交换节点数值）将其移动到链表头部。
  * **复杂度**：寻找最小值仍需遍历未排序部分，时间复杂度依然保持为 $O(n^2)$。

## Bubble Sort 冒泡排序
冒泡排序的核心思想是：通过相邻元素之间的**比较与交换**，使较大（或较小）的元素逐渐“浮”到序列的尾部。

### 步骤
1. 比较相邻的元素。如果前一个比后一个大，就交换它们。
2. 对每一对相邻元素做同样的工作，从开始第一对到结尾的最后一对。这一步完成后，最后的元素会是最大的数。
3. 针对所有的元素重复以上的步骤，除了最后一个（已经排好序的元素）。
4. **优化（可选）**：如果在某一趟遍历中没有发生任何交换，说明序列已经整体有序，可提前结束算法。

```C
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false; // 用于标记本趟是否发生过交换
        for (int j = 0; j < n - 1 - i; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true; // 发生了交换
            }
        }
        // 如果一趟下来没有发生任何交换，说明已经有序，直接退出
        if (!swapped) {
            break;
        }
    }
}
```

### 性能分析
* **时间复杂度**：
  * **最好情况**：$O(n)$。在优化版算法中，如果输入数组本身已经是有序的，只需进行一趟 $n - 1$ 次比较即可检测并退出。
  * **最坏、平均情况**：$O(n^2)$。当数组完全逆序时，需要执行最大次数的比较和交换。
* **空间复杂度**：$O(1)$（原地排序）。
* **稳定性**：稳定。因为只有在满足 `arr[j] > arr[j+1]` 时才会发生交换，如果两个相邻元素相等，则不会发生交换，因此它们的相对顺序不会改变。
* **在链式结构（链表）下的表现**：
  * **可行性**：链表由于具有单向或双向的顺序指针，非常适合进行相邻节点的遍历与比较。在单链表中，可以通过比较相邻节点的值，利用双指针调整节点指向（或直接交换节点数据）。
  * **复杂度**：链表的移动和比较仍然局限于相邻元素，时间复杂度依旧为 $O(n^2)$。
## Insertion Sort 插入排序
### 步骤
排序前已知 0~P-1 位置上的元素是有序的。
对于第 P 趟排序，我们将位置 P 上的元素向前 P 个元素移动，直到发现正确的位置。

### 代码
```C
void InsertionSort(ElementType A[], int N)
{
    int j, P;
    ElementType Tmp;

    for (P = 1; P < N; P++)
    {
        Tmp = A[P] // the next coming card
        for (j = P; j > 0 && A[j - 1] > Tmp; j--)
            A[j] = A[j - 1];
        // shift sorted cards to provide a position for the new coming card
        A[j] = Tmp; // place the new card at the proper position
    } // end for-P-loop
}
```

### 时间复杂度
* 最坏情况：输入的 `A[]` 是逆序的，$T(N) = O(N^2)$
* 最好情况：输入的 `A[]` 是顺序的，$T(N) = O(N)$
* 平均情况：$\Theta(N^2) = \sum_{i=2}^{N} i = 2 + 3 + 4 + \cdots + N$

## A Lower Bound for Simple Sorting Algorithms 简单排序的下界
**定义**：一个数组中数字的**逆序对 (inversion)** 是一个有序对 $(i, j)$，满足 $i < j$ 且 $A[i] > A[j]$

数组中**逆序对**的个数 = 其插入排序过程中的**交换**次数
> 证明：交换两个相邻的元素，就可以消去数组中的一个逆序对


> 所以，插入排序的时间复杂度还可以表示为 $T(N, I) = O(I + N)$，其中 $I$ 是原始数组中逆序对的个数。观察发现，当列表已经排过序了，那么这次排序的速度就会很快。

**定理 1**：对于包含 $N$ 个不同数字的数组，它的**平均逆序对个数**为 $\frac{N(N - 1)}{4}$

**定理 2**：任何通过**交换相邻元素**实现的排序算法，平均时间复杂度为 $\Omega(N^2)$

由这些定理，我们知道：
- 由于算法每次只交换**相邻**的两个元素，每一次交换**最多只能消除 1 个逆序对**。
- 要把一个乱序数组排好序，本质上就是要消除所有的逆序对（排好序的数组逆序对为 0）。
- 我们**绝对不能只交换相邻元素**。我们必须**交换相隔较远的元素**——因为一次远距离的交换，有可能顺便消灭掉好几个逆序对！
> 可以通过在<u>每次交换中消除多个逆序对</u>的方式来提升排序效率
## Shellsort 希尔排序
- 这种算法比较相隔一定距离的元素
- 比较的间隔在算法运行时将不断减小，直到最后比较的是相邻元素
### 步骤
希尔排序将整个数组按照一定的间隔（增量）$h$ 拆分成若干个子序列，对每个子序列分别进行**插入排序**。随着算法运行，间隔 $h$ 逐渐减小，直到 $h = 1$。

- **概念：**
1. 增量序列 (increment sequence)：决定了希尔排序的运行时间
2. $h_k-sort$ ：包含 $h_k$ 次独立的插入排序

* **步骤**：
  1. 选择一个递减至 1 的增量序列 $h_t, h_{t-1}, \dots, h_1 = 1$。
  2. 先进行 $h_t$ -sort（即每隔 $h_t$ 个元素取一个出来组成一组，进行插入排序）。
  3. 再进行 $h_{t-1}$ -sort......
  4. 最后进行 1-sort（此时就是标准的插入排序，但由于数组已经基本有序，运行速度极快）。

### 代码
```C
void Shellsort(ElementType A[], int N)
{
    int i, j, increment;
    ElementType Tmp;
    
    // 最外层循环：控制增量 increment 每次减半
    for (increment = N / 2; increment > 0; increment /= 2)
    {
        // 内部其实就是间隔为 increment 的插入排序
        for (i = increment; i < N; i++)
        {
            Tmp = A[i];
            for (j = i; j >= increment; j -= increment)
            {
                if (Tmp < A[j - increment])
                    A[j] = A[j - increment]; // 跨步挪位置
                else
                    break;
            }
            A[j] = Tmp;
        }
    }
}
```

### 时间复杂度
取决于增量序列
希巴德增量序列可以达到 $O(N^{\frac{3}{2}})$
![image-8](asserts/Chapter11 Sorting/image-8.png)
### 两种增量序列对比
- **希尔增量序列 (Shell's increment sequence)**： $$h_t = \left\lfloor \frac{N}{2} \right\rfloor, \, h_k = \left\lfloor \frac{h_{k+1}}{2} \right\rfloor$$
- **希巴德增量序列 (Hibbard's increment sequence)** $$h_k = 2^k - 1(即1,3,7,15,31)$$
![image](asserts/Chapter11 Sorting/image.png)
## HeapSort 堆排序
### 朴素堆排序
![image-1](asserts/Chapter11 Sorting/image-1.png)

```C
Algorithm 1:
{
    BuildHeap(H);  // O(N)
    for (i = 0; i < N; i++)
        TmpH[i] = DeleteMin(H);  // O(log N)
    for (i = 0; i < N; i++)
        H[i] = TmpH[i];  // O(1)
}
```

### 原地堆排序
> 用最小堆，弹出的最小值会先放在最后一个位置，所以最后得到的排序是递减的。为了得到升序的数组，我们需要建一个最大堆。

注意：此处索引的下标从 0 开始！不同于 Ch 6!
```C
1.辅助函数
#define LeftChild(i) (2 * (i) + 1) // 0 索引下，节点 i 的左孩子是 2*i + 1
void PercDown(ElementType A[], int i, int N)
{
    int Child;
    ElementType Tmp;

    // Tmp 暂存要调整的根节点值，从 i 开始向下过滤
    for (Tmp = A[i]; LeftChild(i) < N; i = Child)
    {
        Child = LeftChild(i);
        // 如果有右孩子，且右孩子比左孩子更大，则把 Child 指向右孩子
        if (Child != N - 1 && A[Child + 1] > A[Child])
            Child++;
            
        // 如果最大的孩子比 Tmp（父亲）还要大，就把孩子往上提
        if (Tmp < A[Child])
            A[i] = A[Child];
        else
            break; // 否则，Tmp 找到了合适的位置，退出循环
    }
    A[i] = Tmp; // 把 Tmp 放入最终空出的位置
}

2.主函数
void Heapsort(ElementType A[], int N)
{
    int i;
    
    // 【阶段 1：BuildHeap 建最大堆】
    // 从最后一个非叶子节点 (N/2 - 1) 开始，自底向上进行下滤调整
    for (i = N / 2; i >= 0; i--) 
        PercDown(A, i, N);
        
    // 【阶段 2：DeleteMax 排序循环】
    for (i = N - 1; i > 0; i--)
    {
        Swap(&A[0], &A[i]); // 把堆顶最大值 A[0] 交换到当前堆的末尾 A[i]
        PercDown(A, 0, i);   // 堆的规模缩小为 i，对新的堆顶 A[0] 进行下滤调整
    }
}
```

#### 性能分析
- 空间复杂度：$O(1)$
- 时间复杂度：$O(NlogN)$
![image-2](asserts/Chapter11 Sorting/image-2.png)
## Mergesort 归并排序
- 时间复杂度：$O(NlogN)$ 
- 采用递归算法
- 稳定

### 核心：两路归并 `Merge`
时间复杂度：$O(N)$ ，N 为两个列表的元素个数总和
![image-3](asserts/Chapter11 Sorting/image-3.png)

### 递归版代码 (自顶向下，从大问题往小问题拆分)
![image-4](asserts/Chapter11 Sorting/image-4.png)

- `A[]`：原数组，里面包含了待合并的两个子片段。
- `TmpArray[]`：辅助数组，用于临时存放合并后的有序结果。

```C
1.主函数
void MergeSort(ElementType A[], int N)
{
    ElementType *TmpArray;
    TmpArray = (ElementType *)malloc(N * sizeof(ElementType));//关键内存优化
    if (TmpArray != NULL)
    {
        MSort(A, TmpArray, 0, N - 1);
        free(TmpArray);
    }
    else FatalError("No space for tmp array!!!");
}
2.分Divide
void MSort(ElementType A[], ElementType TmpArray[], int Left, int Right)
{
    int Center;
    if (Left < Right)
    {
        Center = (Left + Right) / 2;
        MSort(A, TmpArray, Left, Center);
        MSort(A, TmpArray, Center + 1, Right);
        Merge(A, TmpArray, Left, Center + 1, Right);
    }
}

3.治Conquer
// Lpos = start of left half, Rpos = start of right half
void Merge(ElementType A[], ElementType TmpArray[], int Lpos, int Rpos, int RightEnd)
{
    int i, LeftEnd, NumElements, TmpPos;
    LeftEnd = Rpos - 1; // 左半部分的终点：紧挨着右半部分的起点 
    TmpPos = Lpos; // 临时存放结果的指针起点，与左边界对齐 
    NumElements = RightEnd - Lpos + 1; // 本次合并的总元素个数
    
     // 1.main loop
    while (Lpos <= LeftEnd && Rpos <= RightEnd){
        if (A[Lpos] <= A[Rpos])
            TmpArray[TmpPos++] = A[Lpos++];// 左边小，放左边，左指针右移
        else
            TmpArray[TmpPos++] = A[Rpos++];// 右边小，放右边，右指针右移
    } 
    // 2.Copy rest of first half
    while (Lpos <= LeftEnd) 
        TmpArray[TmpPos++] = A[Lpos++];
    // 3.Copy rest of second half
    while (Rpos <= RightEnd) 
        TmpArray[TmpPos++] = A[Rpos++];
    // 4.Copy TmpArray back
    for (i = 0; i < NumElements; i++, RightEnd--)
        A[RightEnd] = TmpArray[RightEnd];
}
```

### 迭代版代码 (自底向上，从小问题往大问题合并)
```C
//merge_sort(控制中心)
void merge_sort( ElementType list[], int N )
{
    ElementType extra[MAXN];  /* 申请一个额外的辅助空间 */
    int length = 1;           /* 初始子序列长度为 1 */
    while( length < N ) {
        // 第一步：把 list 里的数据，两两合并到 extra 中
        merge_pass( list, extra, N, length );   
        output( extra, N );   // 打印当前趟的结果
        length *= 2;          // 步长翻倍
        
        // 第二步：直接把 extra 里的数据，两两合并回 list 中（免去了拷贝过程！）
        merge_pass( extra, list, N, length );   
        output( list, N );    // 打印当前趟的结果
        length *= 2;          // 步长再次翻倍
    }
}

//merge_pass(分段引擎)
void merge_pass( ElementType list[], ElementType sorted[], int N, int length );
{
    int i;
    int ptr_l, ptr_r, ptr;

    ptr = 0;
    for (i = 0; i < N; i += 2 * length)
    {
        ptr_l = i;//左子列的开头
        ptr_r = i + length;//右子列的开头
        while (ptr_l < i + length && ptr_r < i + 2 * length && ptr_r < N)
        //因为可能遇到右半部分不完整，甚至右半部分根本不存在的情况，ptr_r < N 保证了右指针不会越界访问
        {
            if (list[ptr_l] <= list[ptr_r])
                sorted[ptr++] = list[ptr_l++];
            else
                sorted[ptr++] = list[ptr_r++];
        }
        while (ptr_l < i + length)
            sorted[ptr++] = list[ptr_l++];
        while (ptr_r < i + 2 * length && ptr_r < N)
            sorted[ptr++] = list[ptr_r++];        
    }
}   

void output( ElementType list[], int N )
{
    int i;
    for (i=0; i<N; i++) printf("%d ", list[i]);
    printf("\n");
}
```

### 复杂度分析与应用场景
![image-5](asserts/Chapter11 Sorting/image-5.png)
## QuickSort 快速排序
> QuickSort 和QuickSelect 的递归非递归算法都要会

- **基本性质**：
    1. 快速排序在每一趟划分（partition）之后，所选择的基准元素（Pivot）一定会到达它在最终有序序列中的正确位置。
    2. 对于任意一个已经是最终位置的元素，其左边的元素都比它小，右边的元素都比它大。 
    3. 一趟排序后，若基准元素不在边界，会将序列分成两个非空的子序列，下一趟必须对这两个子序列都进行划分；若基准元素在边界，则只需对剩下的一个子序列进行划分。
### 如何选取 `pivot`
- 错误的方法：`pivot=A[0]`
- 安全的策略：`pivot = random select from A[]` 随机数生成成本高
- 三数中值分割法：`pivot = median(left, center, right)` 挑选数组中最左边、中间、最右边三个元素的中数，这不仅消除了最坏情况 ( 输入前已排好序 )，还节省了 5% 的运行时间
![image-10](asserts/Chapter11 Sorting/image-10.png)
### 划分策略 Partitioning Strategy
![image-9](asserts/Chapter11 Sorting/image-9.png)

### Small Arrays
- 问题：当数组规模较小 (N≤20) 时，快排比插排慢
- 解决方案：当 N 较小时，采用另一种更有效的算法（比如插排）

```C
void Quicksort(ElementType A[], int N)
{
    Qsort(A, 0, N - 1);
    // A: the array
    // 0: Left index
    // N - 1: Right index
    // Return median of Left, Center, and Right
    // Order these and hide the pivot
}

void Qsort(ElementType A[], int Left, int Right)
{
    int i, j;
    ElementType Pivot;

    if (Left + Cutoff <= Right) // if the sequence is not too short
    {
        Pivot = Median3(A, Left, Right);  // select pivot
        i = Left;                         // (1)
        j = Right - 1;                    // (2)
        for (;;)
        {
            while (A[++i] < Pivot) {}     // scan from left
            while (A[--j] > Pivot) {}     // scan from right
            if (i < j)
                Swap(&A[i], &A[j]);       // adjust partition
            else break;                   // partition done
        }
        Swap(&A[i], &A[Right - 1]);       // 恢复基准元的位置，放回到中间restore pivot
        Qsort(A, Left, i - 1);            // recursively sort left part   
        Qsort(A, i + 1, Right);           // recursively sort right part  
    }  // end if - the sequence subarray
    else
        InsertionSort(A + Left, Right - Left + 1);
}

ElementType Median3(ElementType A[], int Left, int Right)
{
    int Center = (Left + Right) / 2;
    if (A[Left] > A[Center])
        Swap(&A[Left], &A[Center]);
    if (A[Left] > A[Right])
        Swap(&A[Left], &A[Right]);
    if (A[Center] > A[Right])
        Swap(&A[Center], &A[Right]);
    // Invariant: A[Left] <= A[Center] <= A[Right]
    
    Swap(&A[Center], &A[Right - 1]);//把pivot放到倒数第二个位置
    // only need to sort A[Left + 1] .. A[Right - 2]
    // 因为我们已经知道 A[Left] 比 pivot 小，A[Right] 比 pivot 大
    // 所以回到 Qsort 函数后，我们无需改变 A[Left] 和 A[Right] 的顺序
    return A[Right - 1]; // Return pivot
}
```

> 为什么 (1) 和 (2) 不能分别替换为：`i = Left + 1; j = Right - 2;` 呢？
> 这样会漏掉 `A[Left + 1]` 和 `A[Right - 2]` 两个元素的判断，这显然是错误的
> 注意 `++i` 还是 `i++`
### 快排时间复杂度
- 最坏情况：$O(N^2)$
- 最好情况：$O(NlogN)$
- 平均情况：$O(NlogN)$
![image-28](asserts/Chapter11 Sorting/image-28.png)
### 优化：Qselect 快速选择排序
时间复杂度：
- 最坏情况：$O(N^2)$
- 平均情况：$O(N)$

问题：找 N 个元素的序列中第 k 大的元素
> **快速排序 (Quick Sort)** 和 **快速选择 (Quick Select)**，最核心的秘诀是：它们共享同一个核心操作——Partition（划分）区别仅在于后续是“两头都走”(Qsort)还是“只走一头”(Qselect)。
```C
// Places the kth smallest element in the kth position
// Because arrays start at 0. this will be index k-1
void Qselect(ElementType A[], int k, int Left, int Right)
{
    int i, j;
    ElementType Pivot;

    if (Left + Cutoff <= Right)
    {
        Pivot = Median3(A, Left, Right);
        i = Left; j = Right - 1;
        for (;;)
        {
            while (A[++i] < Pivot) {}
            while (A[--j] > Pivot) {}
            if (i < j)
                Swap(&A[i],  &A[j]);
            else
                break;
        }
        Swap(&A[i], &A[Right - 1]);
		
		// 目标在左边，只递归左边
        if (k <= i)
            Qselect(A, k, Left, i - 1);
        // 目标在右边，只递归右边
        else if (k > i + 1)
            Qselect(A, k, i + 1, Right);
        // k=i+1,即当前 Pivot 正好是第k小的元素，不用递归
    }
    else 
        InsertionSort(A + Left, Right - Left + 1);
}
```

![image-29](asserts/Chapter11 Sorting/image-29.png)

## Sorting Large Structures 
> 表排序是脑力劳动，物理排序是体力劳动，一般表排序之后要进行物理排序
![image-33](asserts/Chapter11 Sorting/image-33.png)
### Table Sort 表排序
在实际开发中，我们经常需要对结构体（如包含姓名、身份证号、地址、历史记录等大量字段的记录）进行排序。

- **问题**：传统的排序算法（如快排、归并）在排序过程中需要频繁交换元素。如果元素非常大（例如每个结构体占用几百字节），频繁复制和交换这些大型结构体的内存开销是非常巨大的。
- **解决方案：间接排序（Indirect Sorting / Table Sort）**
    -  我们不直接移动结构体本身，而是另外建立一个“索引表”或“指针表”（代码中称为 `table[]`）。
    - 在排序时，我们只比较结构体的大小，但**交换的是 table 数组中的索引值**。
![image-12](asserts/Chapter11 Sorting/image-12.png)

![image-11](asserts/Chapter11 Sorting/image-11.png)

![image-34](asserts/Chapter11 Sorting/image-34.png)
### Physical Sort 物理排序
![image-14](asserts/Chapter11 Sorting/image-14.png)

![image-35](asserts/Chapter11 Sorting/image-35.png)

![image-13](asserts/Chapter11 Sorting/image-13.png)

时间复杂度：$T=O(mN)$ ,m 为结构体大小
![image-15](asserts/Chapter11 Sorting/image-15.png)
## General Lower Bound for Sorting 比较排序的下界
定理：任何**基于比较**进行排序的算法，其最坏情况的计算时间为 `Ω(Nlog⁡N)`
![image-18](asserts/Chapter11 Sorting/image-18.png)

![image-16](asserts/Chapter11 Sorting/image-16.png)
![image-17](asserts/Chapter11 Sorting/image-17.png)

## Non-comparison Based Sorts 非比较排序 
### Bucket Sort 桶排序
问题：假设有 N 个学生，每个学生有一个在 0-100（因此有 M = 101 可能的不同分数）之间的成绩，那么如何在线性时间内根据他们的乘积进行排序？

![image-19](asserts/Chapter11 Sorting/image-19.png)

```C
Algorithm
{
    initialize count[];
    while (read in a student's record)
        insert to list count[stdnt.grade];
    for (i = 0; i < M; i++)
    {
        if (count[i])
            output list count[i];
    }
}
```

时间复杂度：$T(N,M)=O(M+N)$
![image-20](asserts/Chapter11 Sorting/image-20.png)
### Radix Sort 基数排序——LSD 最低位优先策略
![image-22](asserts/Chapter11 Sorting/image-22.png)

LSD 遇到个位数相同的情况，保持原来的相对先后顺序
![image-21](asserts/Chapter11 Sorting/image-21.png)
时间复杂度：$T=O(P(N+B))$
- P 为排序多少遍，取决于被排序的数有几位
- N 为被排序的元素个数
- B 为数制，即桶的个数

### 多键值排序
#### 字典序
![image-27](asserts/Chapter11 Sorting/image-27.png)

![image-23](asserts/Chapter11 Sorting/image-23.png)

![image-26](asserts/Chapter11 Sorting/image-26.png)
### 两种策略
![image-36](asserts/Chapter11 Sorting/image-36.png)
#### 最高位排序
![image-24](asserts/Chapter11 Sorting/image-24.png)

#### 最低位排序
![image-25](asserts/Chapter11 Sorting/image-25.png)


## 总结
### 性能对比
![image-6](asserts/Chapter11 Sorting/image-6.png)

![image-7](asserts/Chapter11 Sorting/image-7.png)

### 各种排序中的 run 指的是什么
定义：在排序过程中，对每一个尚未到达最终位置的元素进行处理，称为一趟（run）”
历年卷中出现过很多关于排序的 "run" 问题：问第 k 次 run 后列表里的元素排序是什么？题目中的 run 可能和我们的直觉认识相冲突：

- 选择、冒泡、插入：一遍外层循环
- 希尔排序：一次 hkhk​-sort
- 归并排序（以迭代版为例）：对于**整张列表**，每 2 k 2 k 个元素进行归并排序，直到排完所有元素后的结果
- 快排：对于**整张列表**，找到当前能找的所有支点 (pivot) 后的结果（如果不理解，可以回顾一下前面介绍的原理，以及对应的题目）

## 解题技巧
![image-31](asserts/Chapter11 Sorting/image-31.png)

![image-30](asserts/Chapter11 Sorting/image-30.png)

![image-32](asserts/Chapter11 Sorting/image-32.png)

