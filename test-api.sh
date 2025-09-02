#!/bin/bash

# Script para testar a API do Patient Management System
# Salve este arquivo como test-api.sh e execute: bash test-api.sh

API_URL="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 TESTANDO API - Patient Management System${NC}"
echo "================================================"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "\n${BLUE}🔄 Testing: $description${NC}"
    echo "Method: $method | Endpoint: $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ SUCCESS ($http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ FAILED ($http_code)${NC}"
        echo "$body"
    fi
    
    # Store patient ID for later tests
    if [ "$endpoint" = "/patients" ] && [ "$method" = "POST" ] && [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        PATIENT_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
        echo -e "${GREEN}📝 Stored Patient ID: $PATIENT_ID${NC}"
    fi
}

echo -e "\n${BLUE}1️⃣  HEALTH CHECKS${NC}"
echo "================================"

# Test API Health
test_endpoint "GET" "/health" "API Health Check"

# Test Service Health  
test_endpoint "GET" "/patients/health" "Patient Service Health"

# Test API Info
test_endpoint "GET" "/" "API Info"

echo -e "\n${BLUE}2️⃣  PATIENT CRUD OPERATIONS${NC}"
echo "================================"

# Test Create Patient
test_endpoint "POST" "/patients" "Create New Patient" '{
    "name": "João Silva Santos",
    "birthDate": "1985-03-15",
    "email": "joao.test@email.com",
    "address": "Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567"
}'

# Wait a moment for cache
sleep 1

# Test Get All Patients
test_endpoint "GET" "/patients" "Get All Patients"

# Test Get Patients with Pagination
test_endpoint "GET" "/patients?page=1&limit=5" "Get Patients with Pagination"

# Test Get Patient by ID (if we have one)
if [ ! -z "$PATIENT_ID" ]; then
    test_endpoint "GET" "/patients/$PATIENT_ID" "Get Patient by ID"
    
    # Test Update Patient
    test_endpoint "PUT" "/patients/$PATIENT_ID" "Update Patient" '{
        "name": "João Silva Santos Updated",
        "address": "Rua das Flores Atualizada, 456, Centro, São Paulo - SP"
    }'
fi

echo -e "\n${BLUE}3️⃣  SEARCH AND FILTERS${NC}"
echo "================================"

# Test Search
test_endpoint "GET" "/patients/search?q=joão" "Search Patients"

# Test Age Filter
test_endpoint "GET" "/patients/age-range?minAge=30&maxAge=50" "Filter by Age Range"

echo -e "\n${BLUE}4️⃣  STATISTICS AND EXPORTS${NC}"
echo "================================"

# Test Stats
test_endpoint "GET" "/patients/stats" "Get Patient Statistics"

# Test Export JSON
test_endpoint "GET" "/patients/export?format=json" "Export Patients (JSON)"

echo -e "\n${BLUE}5️⃣  BULK OPERATIONS${NC}"
echo "================================"

# Test Bulk Create
test_endpoint "POST" "/patients/bulk" "Bulk Create Patients" '{
    "patients": [
        {
            "name": "Maria Oliveira Costa",
            "birthDate": "1990-07-22",
            "email": "maria.bulk@email.com",
            "address": "Avenida Brasil, 456, Zona Sul, Rio de Janeiro - RJ"
        },
        {
            "name": "Carlos Alberto Ferreira",
            "birthDate": "1978-12-03",
            "email": "carlos.bulk@email.com", 
            "address": "Praça da Liberdade, 789, Centro, Belo Horizonte - MG"
        }
    ]
}'

echo -e "\n${BLUE}6️⃣  ERROR HANDLING${NC}"
echo "================================"

# Test Invalid Patient ID
test_endpoint "GET" "/patients/invalid-id" "Invalid Patient ID"

# Test Duplicate Email
test_endpoint "POST" "/patients" "Duplicate Email (Should Fail)" '{
    "name": "Duplicate User",
    "birthDate": "1990-01-01",
    "email": "joao.test@email.com",
    "address": "Some address here with enough characters"
}'

# Test Invalid Data
test_endpoint "POST" "/patients" "Invalid Data (Should Fail)" '{
    "name": "X",
    "birthDate": "2030-01-01",
    "email": "invalid-email",
    "address": "short"
}'

echo -e "\n${BLUE}7️⃣  CLEANUP (Optional)${NC}"
echo "================================"

# Delete test patient if we have the ID
if [ ! -z "$PATIENT_ID" ]; then
    echo -e "\n${BLUE}🗑️  Do you want to delete the test patient? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        test_endpoint "DELETE" "/patients/$PATIENT_ID" "Delete Test Patient"
    fi
fi

echo -e "\n${GREEN}✅ API Testing Complete!${NC}"
echo "========================================"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Check Docker containers: docker-compose ps"
echo "2. View logs: docker-compose logs backend"
echo "3. Access API docs: http://localhost:3001/api/docs"
echo "4. Monitor Redis cache: docker-compose exec redis redis-cli monitor"