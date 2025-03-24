package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run hello.go <directory-to-scan> <ruins-path-to-file>")
		return
	}

	dir := os.Args[1]
	outputFile := os.Args[2]
	todos := make(map[string][]string)

	// Get the list of git ignored files and directories
	cmd := exec.Command("git", "ls-files", "--others", "--ignored", "--exclude-standard")
	cmd.Dir = dir
	output, err := cmd.Output()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	ignoredPaths := strings.Split(string(output), "\n")

	err = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip ignored files and directories
		for _, ignoredPath := range ignoredPaths {
			if ignoredPath != "" && strings.HasPrefix(path, filepath.Join(dir, ignoredPath)) {
				if info.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
		}

		if !info.IsDir() {
			file, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			re := regexp.MustCompile(`// TODO.*`)
			matches := re.FindAllString(string(file), -1)
			if len(matches) > 0 {
				todos[path] = matches
			}
		}
		return nil
	})

	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	jsonData, err := json.MarshalIndent(todos, "", "  ")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	err = os.WriteFile(outputFile, jsonData, 0644)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("TODOs have been written to todos.json")
}
