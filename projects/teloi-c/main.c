#include <stdio.h>
#include <string.h>

/**
 * Object is a fundamental item in the db.
 *
 * @param fun_type — Fundamental type in system.
 * 1 - Individual
 * 2 - Tuple
 * 3 - Type
 * 4 - TupleType
 *
 */
struct Object {
  int id;
  int fun_type; /* Are there enums in C? Is it common to use them? */
  char *name;
};

struct Object createObj(type, name) {}

int main() {
  struct Object node;

  node.id = 1;
  node.name = "RootNode";

  printf("Object details:\n");
  printf("↳ ID: %d\n", node.id);
  printf("↳ Name: %s\n", node.name);
}
