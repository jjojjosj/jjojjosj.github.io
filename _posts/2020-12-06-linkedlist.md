---
title: "연결리스트"
date: 2020-12-06 11:10:00 # date: 2020-12-31 23:59:59
categories: [Python] # [IT], [life], [Python]
---

## 연결 리스트(Linked list)

**1. 연결리스트**

2. 스택, 큐
3. 트리
4. 우선순위 큐, 힙
5. 테이블, 해쉬
6. 그래프
7. 탐색과 정렬
8. 재귀

첫 번째 카테고리인 연결 리스트에 대한 공부 내용이다. 파이썬에서는 이미 리스트 자료구조가 기본적으로 포함되어 있다. 그럼 파이썬의 리스트 자료구조에 대해 먼저 살펴보면,

* 데이터를 나란히 저장
* 중복된 데이터의 저장이 가능
* 데이터에 순서가 있음. 수정가능한 객체임

```python
>>> [1, 2, 'a']
[1, 2, 'a']
>>> myvar = [1, 2, 'a']
>>> type(myvar)
<class 'list'>
```

파이썬에서의 리스트는 쓰임새가 많고 설명할 것도 많으므로 여기서는 다루지 않는다. 

이번 주제인 **'연결 리스트'** 에 집중해보면, 말 그대로 '리스트'를 '연결'해둔 자료구조라고 할 수 있겠다. 

그럼 '어떻게' 리스트를 '연결' 해두었을까?

리스트를 기차처럼 연결한 것이 연결리스트라고 할 수 있을 것 같다. 기차는 부분부분이 '량'이라는 요소로 되어 있고, '량'(노드)들을 서로 '연결'하는 구조로 구성된다.

각 노드들을 연결하기 위한 head, tail과 노드 안에 담길 데이터 부분으로 구성된다고 할 수 있겠다. 이러한 특성을 기반으로 연결리스트 클래스를 작성해보면, 먼저 '노드' 에 대한 정의가 필요하다.

노드(node)는 '데이터 부분(data)'과 '다른 변수를 가리키기 위한 부분(next)'이 구분된다. 

![노드 이미지](/assets/img/node.png )

```python
class Node():
    def __init__(self, data):
        self.data = data
        self.next = None
```

그리고 이 노드들을 연결하는 클래스를 만든다.
![연결리스트 이미지](/assets/img/linkedlist.png )
```python
class LinkedList():
    def __init__(self):
        self.head = None
        self.tail = None
    
    def append(self, node):
        # 첫번째 노드라면, head에 저장한다.
        # 두 번째 이후 노드라면, tail 에 저장한다.
        if self.head is None:
            self.head = node
        else:
            self.tail.next = node

        self.tail = node

    def get(self):
        if self.head is None:
            return "Empty LinkedList"
        else:
            cur = self.head
            result_str = ''
            result_str += cur.data + ' '
            while cur.next is not None:
                cur = cur.next
                result_str += cur.data + ' '
        # 마지막 띄어쓰기는 제거
        return result_str[:-1]

    def __repr__(self):
        return self.get()

    def delete_first(self):
        if self.head is None:
            print("삭제할 노드가 없음")
        else:
            delnode = self.head
            delnextnode = self.head.next

            print("%s을(를) 삭제" % self.head.data)
            del self.head
            self.head = delnextnode
```

마지막으로 이를 구동할 메인함수를 만들어보자

```python
if __name__ == '__main__':
    myll = LinkedList()
    myll.append(Node('a'))
    print(myll)
    myll.append(Node('b'))
    print(myll)
    myll.append(Node('c'))
    print(myll)
    myll.delete_first()
    print(myll)
    myll.delete_first()
    print(myll)
    myll.delete_first()
    print(myll)
    # 비어있는 연결리스트에 delete 해보기
    myll.delete_first()
```

결과는 아래와 같이 나온다.
```
a
a b
a b c
a을(를) 삭제
b c
b을(를) 삭제
c
c을(를) 삭제
Empty LinkedList
삭제할 노드가 없음
```

간단한 연결리스트를 구현해보았다. 연결리스트는 이렇게 간단한 구조 말고도 이중 연결 리스트, 원형 연결 리스트 등이 있다.(다음 기회에...)