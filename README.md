# CANVERSE project
Blockchain service project code with NestJs

- CANVERSE 서비스가 종료됨에 따라 개인작업물을 정리해서 올려놓은 레포지토리입니다.
- https://www.canverse.org

## **Backend Spec**

#### **- NestJs**

- Express를 사용했던 예전 코드를 NestJS로 마이그레이션 했고, 대부분의 코드작업을 수행했습니다. 마이그레이션의 이유는 아래와 같습니다.
  - 외주 작업자가 빠르게 작업했던 이전의 하나의 패키지에 컨트롤러와 서비스레이어가 모여있던 스파게티 코드형태를 빠르게 수정해야 캡슐화를 통한 효율적인 유지보수가 가능했습니다.
  - 자바스크립트로 작성된 코드를 모두 타입스크립트로 수정을 해야 한다고 판단했고 디폴트로 타입스크립트를 사용하는 NestJS를 사용하게 되었습니다.


#### **- MongoDB + MongooseODM**

- Schema-less 구조를 사용함과 동시에 아래 사유들로 인해 NoSQL을 선택, MongoDB를 사용했습니다.
  - 다양한 형태의 데이터 저장 가능
  - 데이터 모델의 유연한 변화 가능(데이터 모델 변경, 필드 확장 용이)
  - Read/Write 성능이 뛰어남
  - 장비 확장이 간단함
  - JSON 구조 :  데이터를 직관적으로  이해 가능

#### **- GCP VM**

#### **- Swagger**
