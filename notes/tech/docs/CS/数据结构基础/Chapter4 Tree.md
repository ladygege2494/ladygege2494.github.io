四种遍历的时间复杂度是 O (N)，因为每个节点只被访问一次

性质一：树中所有结点数等于所有结点的度数之和加 1。
性质二：对于度为 m 的树，第 i 层上最多有 m 1 个结点。

## 树
### 定义
![image](asserts/Chapter4 Tree/image.png)

![image-1](asserts/Chapter4 Tree/image-1.png)

### 基本性质
#### 性质一 ：树中所有结点数等于所有结点的度数之和加 1（这个 1 加的就是根节点）。
![image-2](asserts/Chapter4 Tree/image-2.png)
节点数=所有节点的度数+1=各种度数的节点数之和
![image-3](asserts/Chapter4 Tree/image-3.png)
#### 性质二：对于度为 m 的树，第 i 层上最多有 $m^{i-1}$ 个结点。
![image-4](asserts/Chapter4 Tree/image-4.png)

#### 性质三：对于高度为 h, 度为 m 的树，最多有 ($m^h$ -1)/(m-1) 个结点。
## 二叉树
### 定义
![image-5](asserts/Chapter4 Tree/image-5.png)

![image-6](asserts/Chapter4 Tree/image-6.png)

### 基本性质
#### 性质一：二叉树的第 i 层最多有 $2^{i-1}$（i≥1) 个结点。
![image-7](asserts/Chapter4 Tree/image-7.png)
#### 性质二：深度为 K 的二叉树最多有 $2^{k}-1$（k≥1) 个结点。
![image-8](asserts/Chapter4 Tree/image-8.png)
#### 性质三：对于任何非空的二叉树 T, 如果叶子结点的个数为 $n_0$, 而度为 2 的结点数为 $n_2$，则 $n_0=n_2+1$
![image-9](asserts/Chapter4 Tree/image-9.png)

## 特殊二叉树
### 满二叉树
![image-10](asserts/Chapter4 Tree/image-10.png)
### 完全二叉树
#### 定义
没有左子树，不能有右子树，上一层没有铺满，不能有下一层
![image-11](asserts/Chapter4 Tree/image-11.png)
不是完全二叉树
![image-12](asserts/Chapter4 Tree/image-12.png)
是完全二叉树
![image-13](asserts/Chapter4 Tree/image-13.png)

#### 性质
![image-14](asserts/Chapter4 Tree/image-14.png)

### 例题
选 C
![image-15](asserts/Chapter4 Tree/image-15.png)
选 C
![image-16](asserts/Chapter4 Tree/image-16.png)
选 A
![image-17](asserts/Chapter4 Tree/image-17.png)

## 二叉树的代码实现
顺序结构在除满二叉树和完全二叉树外放其它场景比较浪费空间。因此我们一般都用链式结构。
### 递归遍历（利用系统自动出入栈）
#### 初始化
![image-18](asserts/Chapter4 Tree/image-18.png)

```C
typedef char ElemType;
typedef struct TreeNode{
	ElemType data;
	TreeNode* lchild;
	TreeNode* rchild;
}TreeNode;

typedef TreeNode* BiTree;

void createTree(BiTree* T){
	ElemType ch;
	ch=str[idx++];
	if(ch=='#'){
		*T=NULL;
	}else{
		*T=(BiTree)malloc(sizeof(TreeNode));
		(*T)->data=ch;
		createTree(&(*T)->lchild);
		createTree(&(*T)->rchild);
	}
}
```

> 在 C 语言中，-> 的优先级比 * 和 & 都要高。  
> 所以 `&(*T)->lchild` 的实际执行顺序是：
> 1. 先做 \*T（解引用二级指针得到当前节点指针）
> 2. 接着做 ->lchild（访问成员）
> 3. 最后做 &（取成员的地址）
#### 前序遍历
> 一旦扩展到一个节点，就输出该节点。

```C
void preOrder(){
	if(T==NULL){
		return;
	}
	printf("%c",T->data);//打印放前面
	preOrder(T->lchild);
	preOrder(T->rchild);
}
```

最终输出内容：ABDHKECFIGJ
![image-19](asserts/Chapter4 Tree/image-19.png)


#### 中序遍历
先访问根结点，向树的左下方移动，直到遇到空结点为止，然后访问空结点的父结点。接着继续遍历该结点的右子树，如果右子树没的子树可以遍历，那么继续遍历上一层最后一个未被访问的结点。
> 扩展节点的左子树 return 后，输出该节点，然后继续扩展右子树。

```C
void inOrder(BiTree T){
	if(T==NULL){
		return;
	}
	inOrder(T->lchild);
	printf("%c",T->data);//打印放中间
	inOrder(T->rchild);
}
```

最终输出内容：HKDBEAIFCGJ
![image-20](asserts/Chapter4 Tree/image-20.png)
#### 后序遍历
从根结点开始先访问结点的左右儿子，再对该结点进行访问。这就意味着结点的儿子将在该结点之前输出。
> 两个孩子全部输出后，才能输出母节点。

```C
void postOrder(BiTree){
	if(T==NULL){
		return;
	}
	postOrder(T->lchild);
	postOrder(T->rchild);
	printf("%c",T->data);
}
```

最终输出内容：KHDEBIFJGCA

#### 验证
```C
int main(int argc,char const* argv[]){
	BiTree T;
	createTree(&T);
	
	preOder(T);printf("\n");
	inOder(T);printf("\n");
	postOder(T);printf("\n");
	
	return 0;
}
```

### 非递归遍历
#### 前序遍历
```C
void interPreOder(Stack* s,BiTree T){
	while(T!=NULL||isEmpty(s)!=0){
		while(T!=NULL){
			printf("%c",T->data);
			push(s,T);
			T=T->lchild;
		}
		pop(s,&T);
		T=T->rchild;
	}
}
```

#### 中序遍历
```C
void iterInOrder(Stack* s, BiTree T) { 
	while (T != NULL || isEmpty(s) != 0) {
	 // isEmpty返回0表示不空 
	 while (T != NULL) { push(s, T); 
	 // 只是压栈，先不打印 
	 T = T->lchild; 
	 // 一路向左 
	} 
	pop(s, &T); // 没左孩子了，出栈 
	printf("%c", T->data); // 出栈时打印（左-根-右的“根”） 
	T = T->rchild; // 转向右子树 
	} 
}
```


#### 后序遍历
```C
void iterPostOrder(Stack* s, BiTree T) { 
	BiTree lastVisit = NULL; // 记录上一次访问的节点 
	while (T != NULL || isEmpty(s) != 0) { 
	while (T != NULL) { 
		push(s, T);
		 T = T->lchild; // 一路向左 
	} 
	// 读取栈顶元素（注意：这里只是读取，不弹出）
	getTop(s, &T); 
	// 如果右子树为空，或者右子树刚刚访问过 
	if (T->rchild == NULL || T->rchild == lastVisit) { 
	printf("%c", T->data); 	// 访问节点
	pop(s, &T); 
	// 真正弹出 
	lastVisit = T; 
	// 更新最近访问记录 
	T = NULL; 
	// 节点访问完，置空以触发下次出栈 
	} else {
		T = T->rchild; // 转向右子树 
		}
	}
 }
```
### 二叉树的遍历性质
已知前序遍历和中序遍历，可以唯一确定一棵二叉树。
已知中序遍历和后序遍历，可以唯一确定一棵二叉树。
已知前序遍历和后序遍历，是不能确定一棵二叉树的。（关键在于叶子的左右没有办法分辨）
### 例题
#### 求三种遍历结果
![image-21](asserts/Chapter4 Tree/image-21.png)
![image-22](asserts/Chapter4 Tree/image-22.png)

#### 根据遍历结果推导二叉树
中序遍历：最中间的是根节点（A），两边分别属于左子树和右子树
前序遍历：排在前面的节点，先考虑是在上面，再考虑是在左边
![image-23](asserts/Chapter4 Tree/image-23.png)

![image-24](asserts/Chapter4 Tree/image-24.png)

证 ABD 对，排除法
![image-25](asserts/Chapter4 Tree/image-25.png)

选 B ![image-26](../../_assets/external/4-ARCHIVE/大一春夏/asserts/大物/image-26.png)

选 A , 虽然只有 10 个节点，但是系统会按照满二叉树的状态开辟存储空间。 ![image-27](asserts/Chapter4 Tree/image-27.png)

## 线索二叉树
### 定义
之前我们只能通过三种遍历得到二叉树的线性排列，现在想用链表的方式直接得到二叉树的线性排列（这样一个 while 循环就可以得到，不用一层层递归遍历了）于是就有了线索二叉树。
![image-28](asserts/Chapter4 Tree/image-28.png)

![image-29](asserts/Chapter4 Tree/image-29.png)

代码层面上，如何区分前驱和后继：
![image-30](asserts/Chapter4 Tree/image-30.png)

### 代码实现
线索化步骤：
- 画出二叉树
- 做完 PPT 中的四件事
- 按照你想要的遍历顺序（前序，中序，还是后序）加线索（前驱和后继）
 ![image-31](asserts/Chapter4 Tree/image-31.png)

#### 初始化
```C
typedef char ElemType;
typedef struct ThreadNode{
	ElemType data;
	struct ThreadNode* lchild;
	struct ThreadNode* rchild;
	int ltag;
	int rtag;
}ThreadNode;
typedef ThreadNode* ThreadTree;

char str[]="ABDH##I##EJ###CF##G##";
int idx=0;

ThreadTree prev;//存放上一个访问的节点
```

#### 创建树
为什么要传指针的指针？
因为我们要对 ThreadTree 这个指针做修改，如果只传 ThreadTree 本身，就只是值传递，就没有办法修改这个值。

我们可以把 T 理解为指向节点的指针，因为节点本身 ThreadTree 也是一个指针，所以 T 就是指向指针的指针。

```C
//基于字符串画一棵树
void createTree(ThreadTree* T){
	ElemType ch;
	ch=str[idx++];
	if(ch=='#'){
		*T=NULL;
	}else{
		//ThreadTree相当于ThreadNode*
		*T=(ThreadTree)malloc(sizeof(ThreadNode));
		(*T)->data=ch;
		
		createTree(&(*T)->lchild);
		if((*T)->lchild!=NULL){
			(*T)->ltag=0;
		}
		createTree(&(*T)->rchild);
		if((*T)->rchild!=NULL){
			(*T)->rtag=0;
		}
	}
}
```

#### 整体线索化（做四件事）
注意整个线索化的过程传进去的是指针 ThreadTree，而不是指针的指针。
```C
void inOrderThreading(&head,T)
	//头结点
	*head=(ThreadTree)malloc(sizeof(ThreadNode));
	(*head)->ltag=0;
	(*head)->rtag=1;
	(*head)->rchild=(*head);
	
	if(T==NULL){
		(*head)->lchild=*head;
	}else{
		(*head)->lchild=T;
		prev=(*head);
		
		threading(T);
		//最后一个节点线索化
		prev->rchild=*head;
		prev->rtag=1;
	}
}
```

#### 具体线索化
注意整个线索化的过程传进去的是指针 ThreadTree，而不是指针的指针。
```C
//此处以中序遍历为例
void threading(ThreadTree T){
	if(T!=NULL){
		threading(T->lchild);
		if(T->lchild==NULL){
			T->ltag=1;
			T->lchild=prev;
		}
		if(prev->rchild==NULL){
			prev->rtag=1;
			prev->rchild=T;
		}
		prev=T;
		threading(T->rchild);
	}
}
```

#### 中序遍历
```C
void inOder(*){
	ThreadTree curr; 
	curr T->lchild; 
	while(curr!=IT){ 
		while(curr->ltag==0){
		 curr curr->lchild;
		} printf("%c "curr->data);
	 	while(curr->rtag =1 & curr->rchild !T){ 
	 		curr curr->rchild;
	 		printf("%c "curr->data); 
		}
	 	curr= curr->rchild; 
	 }
	 printf("\n");
}

```


#### 验证
```C
int main(int argc,char const* argv[]){
	ThreadTree head;
	ThreadTree T;
	//创建
	createTree(&T);
	//线索化
	inOrderThreading(&head,T);
	//基于线索遍历
	inOrder(head);
	return 0;
}
```

### 例题
![image-32](asserts/Chapter4 Tree/image-32.png)
![image-33](asserts/Chapter4 Tree/image-33.png)

---
## 解题技巧
双向链表与二叉树虽然代码实现上相似，都有一个数据域两个指针域，但是意义完全不同，应该理解成两种不同的数据结构。
![image-34](asserts/Chapter4 Tree/image-34.png)

### 树的表示
![image-38](asserts/Chapter4 Tree/image-38.png)
![image-35](asserts/Chapter4 Tree/image-35.png)

### 节点数相关
![image-37](asserts/Chapter4 Tree/image-37.png)
![image-36](asserts/Chapter4 Tree/image-36.png)

### 求叶子节点数
![image-39](asserts/Chapter4 Tree/image-39.png)