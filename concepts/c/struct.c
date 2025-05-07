#include <stdio.h>

/*
 * Struct allow to define special data types.
 * Exemplars of a struct are stored in memory in a contiguos block
 */
struct Object {
  char name[50]; /* Can I make them variable size? Only with pointers? */
  int id;
  float height;
};

struct Person {
  char name[50];
  int id;
  float height;
} person1, person2; /* You can combine declaration with definition */

/* Structure Padding */
struct mystruct_A {
  char a;
  char gap_0[3]; /* inserted by compiler: for alignment of b */
  int b;
  char c;
  char gap_1[3]; /* -"-: for alignment of the whole struct in an array */
} x;

/* Structure Packing */
struct __attribute__((__packed__)) mystruct_B {
  char a;
  int b;
  char c;
};
/* When would I want to do that and why? */

/* Acessing members */
struct Object obj;
struct Object *objectPtr = &obj;

void setObjStructId(struct Object o, int id) { o.id = id; }

void setObjStructIdByP(struct Object *o, int id) { o->id = id; }

/* Nested Structs */
struct Address {
  char street[50];
  char city[20];
  int zipCode;
};

struct Employee {
  struct Person person;
  struct Address address;
  float salary;
};

/* Self-Referential Structs */
struct Node {
  int data;
  struct Node *next;
};
/* This enables creation of linked lists, trees and graphs.  */

/* Typedef Aliases */
// Without typedef
struct Person person;

// With typedef
typedef struct Thing {
  char name[50];
  int age;
} Thing;

Thing thing1; // Now usable without 'struct' keyword

/* Anonymous sturct */
typedef struct {
  int x, y;
} Point; // Creates type 'Point' directly

/* Array of Structs */
struct Person team[10];
void loopTeam() {
  for (int i = 0; i < 10; i++) {
    printf("Person %d: %s\n", i, team[i].name);
  }
}

/* Passing Structs to a Function */

/* By value - makes a copy */
void updateId(struct Person p) {
  p.id = 30; // Only modifies local copy
}

/* By reference */
void updateId2(struct Person *p) {
  p->id = 30; // Modifies original struct
}

/* By reference with const */
void printPerson(const struct Person *p) {
  printf("Name: %s, Id: %d\n", p->name, p->id);
  // p->id = 30;  // Would cause compiler error
}

/* Dynamic Memory Allocation */

/* Function pointers */
