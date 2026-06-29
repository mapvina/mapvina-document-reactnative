#import "CPPExceptionCatcher.h"
#include <cxxabi.h>
#include <exception>
#include <typeinfo>
#include <execinfo.h>
#include <cstdlib>
#include <objc/runtime.h>
#include <objc/objc-exception.h>

static std::terminate_handler originalHandler = nullptr;

static void customTerminateHandler() {
    std::exception_ptr exptr = std::current_exception();
    if (exptr != std::exception_ptr()) {
        try {
            std::rethrow_exception(exptr);
        } catch (const std::exception& e) {
            NSLog(@"C++ TERMINATE: exception type=%s what=%s", typeid(e).name(), e.what());
        } catch (...) {
            NSLog(@"C++ TERMINATE: unknown exception");
        }
    } else {
        NSLog(@"C++ TERMINATE: no current exception");
    }

    void* callstack[128];
    int frames = backtrace(callstack, 128);
    char** strs = backtrace_symbols(callstack, frames);
    for (int i = 0; i < frames; ++i) {
        NSLog(@"  [%d] %s", i, strs[i]);
    }
    free(strs);

    if (originalHandler) {
        originalHandler();
    } else {
        std::abort();
    }
}

static id exceptionPreprocessor(id exception) {
    NSLog(@"OBJC EXCEPTION PREPROCESSOR: name=%@ reason=%@", [exception name], [exception reason]);
    NSArray *stack = [exception callStackSymbols];
    for (NSString *s in stack) {
        NSLog(@"  %@", s);
    }
    return exception;
}

extern "C" void installCPPExceptionHandler(void) {
    originalHandler = std::set_terminate(customTerminateHandler);
    objc_setExceptionPreprocessor(exceptionPreprocessor);
}

