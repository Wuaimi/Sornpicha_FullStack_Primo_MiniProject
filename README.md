# TypeScript Merge Algorithm

## 1. Project Overview

โปรเจกต์นี้เป็นการเขียนฟังก์ชัน merge() ด้วย TypeScript เพื่อรวม Array จำนวนเต็ม 3 ชุดให้เป็น Array เดียวที่เรียงจากน้อยไปมาก

โดยมีเงื่อนไขว่า

- collection_1 และ collection_3 เรียงจากน้อยไปมาก
- collection_2 เรียงจากมากไปน้อย
- ห้ามใช้ Built-in Sort Function
- ต้องไม่แก้ไขข้อมูลใน Array ต้นฉบับ

## 2. Algorithm Approach

เลือหใช้ Three Pointers โดยให้แต่ละ Collection มี Pointer ของตัวเอง เพื่อใช้เปรียบเทียบค่าปัจจุบันของทั้ง 3 Array แล้วเลือกค่าที่น้อยที่สุดมาใส่ใน Result

สำหรับ `collection_1` และ `collection_3` จะเริ่มอ่านจาก Index 0 ส่วน `collection_2` จะเริ่มจาก Index สุดท้าย เพราะเป็น Array ที่เรียงจากมากไปน้อย ทำให้สามารถอ่านข้อมูลจากน้อยไปมากได้เลยโดยไม่ต้อง Reverse Array

เมื่อเลือกค่าแล้วก็เลื่อน Pointer ของ Collection นั้นไปยังตำแหน่งถัดไป ทำซ้ำจนกว่าจะนำข้อมูลมาครบทุกตัว

ตัวอย่าง:

collection_1 = [1, 5, 9]
collection_2 = [8, 4, 2]
collection_3 = [3, 6, 7]

Result: 
[1, 2, 3, 4, 5, 6, 7, 8, 9]

## 3. Input Validation

เพิ่มการตรวจสอบ Input ก่อนเริ่ม Merge เพื่อให้แน่ใจว่าข้อมูลตรงตามเงื่อนไขของโจทย์

- ตรวจสอบว่า Input เป็น Array และสมาชิกทุกตัวเป็น Integer
- ตรวจสอบลำดับการเรียงของแต่ละ Collection
- รองรับค่าติดลบและเลข 0
- รองรับ Duplicate Values
- ใช้ TypeError และ RangeError สำหรับ Input ที่ไม่ถูกต้อง

สำหรับการตรวจสอบว่าข้อมูลหมดแล้ว จะใช้ Index เป็นตัวเช็กแทนการใช้ตัวเลขมาเป็นค่าอ้างอิง เพื่อให้รองรับข้อมูลได้ทุกค่า

นอกจากนี้ ใช้ readonly number[] เพื่อป้องกันการแก้ไข Array ต้นฉบับ

## 4. Complexity

- **Time Complexity: O(N + M + K)** เพราะแต่ละ Element ถูกอ่านและประมวลผลเพียงครั้งเดียว
- **Space Complexity: O(N + M + K)** สำหรับเก็บ Result Array
- **Auxiliary Space: O(1)** ใช้เพียง Pointer 3 ตัวและตัวแปรเพิ่มเติมเล็กน้อย

การตรวจสอบ Input ใช้เวลา O(N + M + K) เช่นกัน จึงไม่ทำให้ Time Complexity โดยรวมเปลี่ยนไป

## 5. Installation

Requirements:
- Node.js >= 22.12
- npm

ติดตั้ง Dependencies ด้วยคำสั่ง

```bash
git clone <repository-url>
cd typescript-merge-algorithm
npm ci
```

## 6. Run Project

Build โปรเจกต์

```bash
npm run build
```

รันตัวอย่าง

```bash
npm start
```

ตรวจสอบ TypeScript

```bash
npm run typecheck
```

## 7. Unit Tests

ใช้ Vitest สำหรับเขียนและรัน Unit Tests

```bash
npm test
```

รัน Test พร้อมตรวจสอบ Coverage

```bash
npm run test:coverage
```

Test ครอบคลุมกรณีต่าง ๆ เช่น

- Array ปกติและ Array ว่าง
- Collection ที่มีจำนวนสมาชิกไม่เท่ากัน
- ตัวเลขซ้ำกัน
- จำนวนเต็มติดลบและเลข 0
- Input ที่เรียงลำดับไม่ถูกต้อง
- Input ที่ไม่ใช่ Integer หรือไม่ใช่ Array
- ตรวจสอบว่าไม่มีการแก้ไข Array ต้นฉบับ
- ตรวจสอบว่าไม่มีการเรียกใช้ Sort Function

นอกจากนี้ยังมี Randomized Tests จำนวน 300 ชุด เพื่อทดลองกับ Input หลายรูปแบบและตรวจสอบความถูกต้องของผลลัพธ์

## 8. CI

เพิ่ม CI สำหรับรัน Typecheck, Build และ Unit Tests อัตโนมัติ เพื่อเช็กว่าโค้ดยังทำงานได้ถูกต้องหลังจากมีการเปลี่ยนแปลง