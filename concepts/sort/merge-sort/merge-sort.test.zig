const std = @import("std");
const testing = std.testing;
const sort = @import("merge-sort.zig").sort;
const less_then = @import("merge-sort.zig").less_then;

test "sort: empty array" {
    var arr = [_]i32{};
    const expected = [_]i32{};
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: single element" {
    var arr = [_]i32{5};
    const expected = [_]i32{5};
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: already sorted" {
    var arr = [_]i32{ 10, 20, 30, 40, 50 };
    const expected = [_]i32{ 10, 20, 30, 40, 50 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: reverse sorted" {
    var arr = [_]i32{ 50, 40, 30, 20, 10 };
    const expected = [_]i32{ 10, 20, 30, 40, 50 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: all identical elements" {
    var arr = [_]i32{ 7, 7, 7, 7, 7 };
    const expected = [_]i32{ 7, 7, 7, 7, 7 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: negative numbers" {
    var arr = [_]i32{ -5, -1, -10, -2, -8 };
    const expected = [_]i32{ -10, -8, -5, -2, -1 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: mixed positive, negative, and zero" {
    var arr = [_]i32{ 3, -1, 0, 5, -2, 0 };
    const expected = [_]i32{ -2, -1, 0, 0, 3, 5 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: duplicates" {
    var arr = [_]i32{ 58, 26, 58, 31, 26, 26 };
    const expected = [_]i32{ 26, 26, 26, 31, 58, 58 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: original example" {
    var arr = [_]i32{ 31, 41, 59, 26, 41, 58 };
    const expected = [_]i32{ 26, 31, 41, 41, 58, 59 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: two elements, needs swap" {
    var arr = [_]i32{ 5, 1 };
    const expected = [_]i32{ 1, 5 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}

test "sort: two elements, already sorted" {
    var arr = [_]i32{ 1, 5 };
    const expected = [_]i32{ 1, 5 };
    sort(&arr, less_then);
    try testing.expectEqualSlices(i32, &expected, &arr);
}
